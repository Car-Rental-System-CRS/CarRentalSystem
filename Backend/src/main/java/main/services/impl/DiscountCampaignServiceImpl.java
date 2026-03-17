package main.services.impl;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateDiscountCampaignRequest;
import main.dtos.request.GenerateCouponsRequest;
import main.dtos.request.UpdateDiscountCampaignRequest;
import main.dtos.response.CouponResponse;
import main.dtos.response.DiscountCampaignResponse;
import main.entities.Account;
import main.entities.Coupon;
import main.entities.DiscountCampaign;
import main.enums.CouponStatus;
import main.enums.DiscountCampaignStatus;
import main.enums.DiscountCampaignTargetingMode;
import main.mappers.DiscountCampaignMapper;
import main.repositories.AccountRepository;
import main.repositories.CouponRepository;
import main.repositories.DiscountCampaignRepository;
import main.services.DiscountCampaignService;
import main.services.DiscountNotificationService;

@Service
@RequiredArgsConstructor
public class DiscountCampaignServiceImpl implements DiscountCampaignService {

    private static final String COUPON_PREFIX = "ECO";
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final DiscountCampaignRepository discountCampaignRepository;
    private final CouponRepository couponRepository;
    private final AccountRepository accountRepository;
    private final DiscountCampaignMapper discountCampaignMapper;
    private final DiscountNotificationService discountNotificationService;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional(readOnly = true)
    public Page<DiscountCampaignResponse> getAllCampaigns(Pageable pageable) {
        return discountCampaignRepository.findAll(pageable)
                .map(campaign -> discountCampaignMapper.toCampaignResponse(campaign, couponRepository.findByCampaign_Id(campaign.getId()).size()));
    }

    @Override
    @Transactional(readOnly = true)
    public DiscountCampaignResponse getCampaignById(UUID campaignId) {
        DiscountCampaign campaign = getRequiredCampaign(campaignId);
        return discountCampaignMapper.toCampaignResponse(campaign, couponRepository.findByCampaign_Id(campaignId).size());
    }

    @Override
    @Transactional
    public DiscountCampaignResponse createCampaign(CreateDiscountCampaignRequest request) {
        validateCampaignRequest(request);

        DiscountCampaign campaign = DiscountCampaign.builder()
                .name(request.getName().trim())
                .description(request.getDescription().trim())
                .status(DiscountCampaignStatus.DRAFT)
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minimumBookingAmount(defaultZero(request.getMinimumBookingAmount()))
                .maximumDiscountAmount(request.getMaximumDiscountAmount())
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .targetingMode(defaultTargetingMode(request))
                .couponQuantity(request.getCouponQuantity())
                .defaultUsageLimitPerCoupon(defaultUsageLimit(request.getUsageLimitPerCoupon()))
                .targetAccountIdsCsv(toCsv(request.getTargetAccountIds()))
                .build();

        DiscountCampaign saved = discountCampaignRepository.save(campaign);
        return discountCampaignMapper.toCampaignResponse(saved, 0);
    }

    @Override
    @Transactional
    public DiscountCampaignResponse updateCampaign(UUID campaignId, UpdateDiscountCampaignRequest request) {
        validateCampaignRequest(request);
        DiscountCampaign campaign = getRequiredCampaign(campaignId);

        if (campaign.getStatus() == DiscountCampaignStatus.ENDED || campaign.getStatus() == DiscountCampaignStatus.EXPIRED) {
            throw new IllegalArgumentException("Ended or expired campaigns cannot be edited");
        }

        campaign.setName(request.getName().trim());
        campaign.setDescription(request.getDescription().trim());
        campaign.setDiscountType(request.getDiscountType());
        campaign.setDiscountValue(request.getDiscountValue());
        campaign.setMinimumBookingAmount(defaultZero(request.getMinimumBookingAmount()));
        campaign.setMaximumDiscountAmount(request.getMaximumDiscountAmount());
        campaign.setValidFrom(request.getValidFrom());
        campaign.setValidUntil(request.getValidUntil());
        campaign.setTargetingMode(defaultTargetingMode(request));
        campaign.setCouponQuantity(request.getCouponQuantity());
        campaign.setDefaultUsageLimitPerCoupon(defaultUsageLimit(request.getUsageLimitPerCoupon()));
        campaign.setTargetAccountIdsCsv(toCsv(request.getTargetAccountIds()));

        return discountCampaignMapper.toCampaignResponse(discountCampaignRepository.save(campaign), couponRepository.findByCampaign_Id(campaignId).size());
    }

    @Override
    @Transactional
    public DiscountCampaignResponse activateCampaign(UUID campaignId) {
        DiscountCampaign campaign = getRequiredCampaign(campaignId);
        ensurePublishable(campaign);
        campaign.setStatus(DiscountCampaignStatus.ACTIVE);
        DiscountCampaign saved = discountCampaignRepository.save(campaign);
        discountNotificationService.publishCampaignNotifications(saved);
        return discountCampaignMapper.toCampaignResponse(saved, couponRepository.findByCampaign_Id(campaignId).size());
    }

    @Override
    @Transactional
    public DiscountCampaignResponse pauseCampaign(UUID campaignId) {
        DiscountCampaign campaign = getRequiredCampaign(campaignId);
        if (campaign.getStatus() != DiscountCampaignStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active campaigns can be paused");
        }
        campaign.setStatus(DiscountCampaignStatus.PAUSED);
        return discountCampaignMapper.toCampaignResponse(discountCampaignRepository.save(campaign), couponRepository.findByCampaign_Id(campaignId).size());
    }

    @Override
    @Transactional
    public DiscountCampaignResponse endCampaign(UUID campaignId) {
        DiscountCampaign campaign = getRequiredCampaign(campaignId);
        campaign.setStatus(DiscountCampaignStatus.ENDED);
        List<Coupon> coupons = couponRepository.findByCampaign_Id(campaignId);
        for (Coupon coupon : coupons) {
            if (coupon.getStatus() == CouponStatus.AVAILABLE) {
                coupon.setStatus(CouponStatus.CANCELLED);
            }
        }
        couponRepository.saveAll(coupons);
        return discountCampaignMapper.toCampaignResponse(discountCampaignRepository.save(campaign), coupons.size());
    }

    @Override
    @Transactional
    public List<CouponResponse> generateCoupons(UUID campaignId, GenerateCouponsRequest request) {
        DiscountCampaign campaign = getRequiredCampaign(campaignId);
        if (campaign.getStatus() == DiscountCampaignStatus.ENDED || campaign.getStatus() == DiscountCampaignStatus.EXPIRED) {
            throw new IllegalArgumentException("Cannot generate coupons for an ended or expired campaign");
        }

        int quantity = request.getQuantity() != null && request.getQuantity() > 0 ? request.getQuantity() : campaign.getCouponQuantity();
        long existingCount = couponRepository.findByCampaign_Id(campaignId).size();
        if (existingCount + quantity > campaign.getCouponQuantity()) {
            throw new IllegalArgumentException("Coupon generation exceeds the campaign coupon limit");
        }

        List<Account> targetedAccounts = resolveEligibleAccounts(campaign, request);

        List<Coupon> coupons = new ArrayList<>();
        for (int i = 0; i < quantity; i++) {
            Account eligibleAccount = targetedAccounts.isEmpty() ? null : targetedAccounts.get(i % targetedAccounts.size());
            coupons.add(Coupon.builder()
                    .campaign(campaign)
                    .code(generateUniqueCouponCode())
                    .status(CouponStatus.AVAILABLE)
                    .usageLimit(campaign.getDefaultUsageLimitPerCoupon())
                    .usageCount(0)
                    .eligibleAccount(eligibleAccount)
                    .expiresAt(campaign.getValidUntil())
                    .build());
        }

        List<CouponResponse> generatedCoupons = couponRepository.saveAll(coupons).stream()
                .map(discountCampaignMapper::toCouponResponse)
                .toList();

        if (campaign.getStatus() == DiscountCampaignStatus.ACTIVE) {
            discountNotificationService.publishCampaignNotifications(campaign);
        }

        return generatedCoupons;
    }

    @Override
    @Transactional
    public void expireFinishedCampaigns() {
        LocalDateTime now = LocalDateTime.now();
        List<DiscountCampaign> campaigns = discountCampaignRepository.findByStatusAndValidUntilBefore(DiscountCampaignStatus.ACTIVE, now);
        if (campaigns.isEmpty()) {
            return;
        }

        for (DiscountCampaign campaign : campaigns) {
            campaign.setStatus(DiscountCampaignStatus.EXPIRED);
            List<Coupon> coupons = couponRepository.findByCampaign_Id(campaign.getId());
            for (Coupon coupon : coupons) {
                if (coupon.getStatus() == CouponStatus.AVAILABLE || coupon.getStatus() == CouponStatus.RESERVED) {
                    coupon.setStatus(CouponStatus.EXPIRED);
                }
            }
            couponRepository.saveAll(coupons);
        }
        discountCampaignRepository.saveAll(campaigns);
    }

    private void validateCampaignRequest(CreateDiscountCampaignRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new IllegalArgumentException("Campaign name is required");
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new IllegalArgumentException("Campaign description is required");
        }
        if (request.getDiscountType() == null) {
            throw new IllegalArgumentException("Discount type is required");
        }
        if (request.getDiscountValue() == null || request.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Discount value must be greater than 0");
        }
        if (request.getDiscountType().name().equals("PERCENTAGE") && request.getDiscountValue().compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("Percentage discount cannot exceed 100");
        }
        if (request.getValidFrom() == null || request.getValidUntil() == null || !request.getValidFrom().isBefore(request.getValidUntil())) {
            throw new IllegalArgumentException("Campaign validity dates are invalid");
        }
        if (request.getCouponQuantity() == null || request.getCouponQuantity() <= 0) {
            throw new IllegalArgumentException("Coupon quantity must be greater than 0");
        }
    }

    private DiscountCampaign getRequiredCampaign(UUID campaignId) {
        return discountCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new IllegalArgumentException("Discount campaign not found: " + campaignId));
    }

    private void ensurePublishable(DiscountCampaign campaign) {
        if (campaign.getValidFrom() == null || campaign.getValidUntil() == null) {
            throw new IllegalArgumentException("Campaign validity dates are required");
        }
        if (campaign.getCouponQuantity() == null || campaign.getCouponQuantity() <= 0) {
            throw new IllegalArgumentException("Campaign coupon quantity must be greater than 0");
        }
    }

    private String generateUniqueCouponCode() {
        String candidate;
        do {
            StringBuilder builder = new StringBuilder(COUPON_PREFIX).append("-");
            for (int i = 0; i < 8; i++) {
                builder.append(ALPHABET.charAt(secureRandom.nextInt(ALPHABET.length())));
            }
            candidate = builder.toString();
        } while (couponRepository.existsByCode(candidate));
        return candidate;
    }

    private Integer defaultUsageLimit(Integer usageLimit) {
        return usageLimit != null && usageLimit > 0 ? usageLimit : 1;
    }

    private DiscountCampaignTargetingMode defaultTargetingMode(CreateDiscountCampaignRequest request) {
        return request.getTargetingMode() != null ? request.getTargetingMode() : DiscountCampaignTargetingMode.ALL_RENTERS;
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private List<Account> resolveEligibleAccounts(DiscountCampaign campaign, GenerateCouponsRequest request) {
        if (request.getEligibleAccountIds() != null && !request.getEligibleAccountIds().isEmpty()) {
            return accountRepository.findAllById(request.getEligibleAccountIds());
        }

        if (campaign.getTargetingMode() == DiscountCampaignTargetingMode.FILTERED_RENTERS
                && campaign.getTargetAccountIdsCsv() != null
                && !campaign.getTargetAccountIdsCsv().isBlank()) {
            List<UUID> accountIds = java.util.Arrays.stream(campaign.getTargetAccountIdsCsv().split(","))
                    .filter(value -> !value.isBlank())
                    .map(UUID::fromString)
                    .toList();
            return accountRepository.findAllById(accountIds);
        }

        return List.of();
    }

    private String toCsv(List<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return null;
        }
        return ids.stream().map(UUID::toString).collect(Collectors.joining(","));
    }
}
