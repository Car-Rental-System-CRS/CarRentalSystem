package main.services.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import main.dtos.request.BookingCouponValidationRequest;
import main.dtos.response.BookingCouponValidationResponse;
import main.entities.Account;
import main.entities.Booking;
import main.entities.CarType;
import main.entities.Coupon;
import main.entities.CouponRedemption;
import main.enums.CouponRedemptionStatus;
import main.enums.CouponStatus;
import main.enums.DiscountCampaignStatus;
import main.enums.DiscountType;
import main.repositories.AccountRepository;
import main.repositories.CarTypeRepository;
import main.repositories.CouponRedemptionRepository;
import main.repositories.CouponRepository;
import main.services.CouponRedemptionService;

@Service
@RequiredArgsConstructor
public class CouponRedemptionServiceImpl implements CouponRedemptionService {

    private static final int MINIMUM_RENTAL_HOURS = 5;

    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;
    private final CarTypeRepository carTypeRepository;
    private final AccountRepository accountRepository;

    @Override
    @Transactional(readOnly = true)
    public BookingCouponValidationResponse validateCoupon(BookingCouponValidationRequest request, UUID accountId) {
        BigDecimal originalTotal = calculateOriginalTotal(request);
        return validateCouponInternal(request.getCouponCode(), originalTotal, accountId);
    }

    @Override
    @Transactional
    public BookingCouponValidationResponse consumeCouponForBooking(String couponCode, Booking booking, UUID accountId, BigDecimal originalTotal) {
        BookingCouponValidationResponse validation = validateCouponInternal(couponCode, originalTotal, accountId);
        if (!validation.isValid()) {
            throw new IllegalArgumentException(validation.getMessage());
        }

        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found"));
        coupon.setUsageCount(coupon.getUsageCount() + 1);
        coupon.setLastValidatedAt(LocalDateTime.now());
        coupon.setStatus(coupon.getUsageCount() >= coupon.getUsageLimit() ? CouponStatus.REDEEMED : CouponStatus.AVAILABLE);
        couponRepository.save(coupon);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        couponRedemptionRepository.save(CouponRedemption.builder()
                .coupon(coupon)
                .campaign(coupon.getCampaign())
                .booking(booking)
                .account(account)
                .status(CouponRedemptionStatus.CONSUMED)
                .discountAmount(validation.getDiscountAmount())
                .validatedAt(LocalDateTime.now())
                .consumedAt(LocalDateTime.now())
                .build());

        return validation;
    }

    private BookingCouponValidationResponse validateCouponInternal(String couponCode, BigDecimal originalTotal, UUID accountId) {
        if (couponCode == null || couponCode.isBlank()) {
            return invalidResponse(couponCode, originalTotal, "Coupon code is required");
        }

        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElse(null);
        if (coupon == null) {
            return invalidResponse(couponCode, originalTotal, "Coupon code is invalid");
        }

        if (coupon.getCampaign().getStatus() != DiscountCampaignStatus.ACTIVE) {
            return invalidResponse(couponCode, originalTotal, "Campaign is not active");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getCampaign().getValidFrom().isAfter(now) || coupon.getCampaign().getValidUntil().isBefore(now)) {
            return invalidResponse(couponCode, originalTotal, "Coupon has expired");
        }

        if (coupon.getStatus() == CouponStatus.EXPIRED || coupon.getStatus() == CouponStatus.CANCELLED || coupon.getStatus() == CouponStatus.REDEEMED) {
            return invalidResponse(couponCode, originalTotal, "Coupon cannot be used");
        }

        if (coupon.getEligibleAccount() != null && !coupon.getEligibleAccount().getId().equals(accountId)) {
            return invalidResponse(couponCode, originalTotal, "Coupon is not assigned to this renter");
        }

        if (coupon.getUsageCount() >= coupon.getUsageLimit()) {
            return invalidResponse(couponCode, originalTotal, "Coupon usage limit has been reached");
        }

        BigDecimal minimumBookingAmount = coupon.getCampaign().getMinimumBookingAmount();
        if (minimumBookingAmount != null && minimumBookingAmount.compareTo(BigDecimal.ZERO) > 0 && originalTotal.compareTo(minimumBookingAmount) < 0) {
            return invalidResponse(couponCode, originalTotal, "Booking does not meet the coupon minimum amount");
        }

        BigDecimal discountAmount = calculateDiscountAmount(coupon, originalTotal);
        return BookingCouponValidationResponse.builder()
                .valid(true)
                .couponCode(couponCode)
                .originalTotal(originalTotal)
                .discountAmount(discountAmount)
                .discountedTotal(originalTotal.subtract(discountAmount))
                .message("Coupon applied successfully")
                .build();
    }

    private BigDecimal calculateOriginalTotal(BookingCouponValidationRequest request) {
        if (request.getExpectedReceiveDate() == null || request.getExpectedReturnDate() == null || !request.getExpectedReceiveDate().isBefore(request.getExpectedReturnDate())) {
            throw new IllegalArgumentException("Return date must be after pickup date");
        }
        long hours = Duration.between(request.getExpectedReceiveDate(), request.getExpectedReturnDate()).toHours();
        if (hours < MINIMUM_RENTAL_HOURS) {
            throw new IllegalArgumentException("Minimum rental period is " + MINIMUM_RENTAL_HOURS + " hours");
        }

        CarType carType = carTypeRepository.findById(request.getCarTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Car type not found"));

        int quantity = request.getSelectedCarIds() != null && !request.getSelectedCarIds().isEmpty()
                ? request.getSelectedCarIds().size()
                : (request.getQuantity() != null ? request.getQuantity() : 0);
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        long totalMinutes = Duration.between(request.getExpectedReceiveDate(), request.getExpectedReturnDate()).toMinutes();
        long days = totalMinutes / (24 * 60);
        long remainingHours = (totalMinutes % (24 * 60)) / 60;

        BigDecimal hourlyRate = carType.getPrice();
        BigDecimal dailyRate = hourlyRate.multiply(BigDecimal.valueOf(24));
        BigDecimal singleCarTotal = dailyRate.multiply(BigDecimal.valueOf(days))
                .add(hourlyRate.multiply(BigDecimal.valueOf(remainingHours)));

        return singleCarTotal.multiply(BigDecimal.valueOf(quantity));
    }

    private BigDecimal calculateDiscountAmount(Coupon coupon, BigDecimal originalTotal) {
        BigDecimal discountAmount;
        if (coupon.getCampaign().getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount = originalTotal
                    .multiply(coupon.getCampaign().getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            discountAmount = coupon.getCampaign().getDiscountValue();
        }

        if (coupon.getCampaign().getMaximumDiscountAmount() != null
                && coupon.getCampaign().getMaximumDiscountAmount().compareTo(BigDecimal.ZERO) > 0
                && discountAmount.compareTo(coupon.getCampaign().getMaximumDiscountAmount()) > 0) {
            discountAmount = coupon.getCampaign().getMaximumDiscountAmount();
        }

        if (discountAmount.compareTo(originalTotal) > 0) {
            discountAmount = originalTotal;
        }
        return discountAmount.max(BigDecimal.ZERO);
    }

    private BookingCouponValidationResponse invalidResponse(String couponCode, BigDecimal originalTotal, String message) {
        return BookingCouponValidationResponse.builder()
                .valid(false)
                .couponCode(couponCode)
                .originalTotal(originalTotal)
                .discountAmount(BigDecimal.ZERO)
                .discountedTotal(originalTotal)
                .message(message)
                .build();
    }
}
