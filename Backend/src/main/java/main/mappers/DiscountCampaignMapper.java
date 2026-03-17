package main.mappers;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import main.dtos.response.CouponResponse;
import main.dtos.response.DiscountCampaignResponse;
import main.dtos.response.DiscountNotificationResponse;
import main.entities.Coupon;
import main.entities.DiscountCampaign;
import main.entities.DiscountNotification;
import main.enums.DiscountNotificationChannel;
import main.enums.DiscountNotificationReadStatus;

@Component
public class DiscountCampaignMapper {

    public DiscountCampaignResponse toCampaignResponse(DiscountCampaign campaign, int generatedCouponCount) {
        return DiscountCampaignResponse.builder()
                .id(campaign.getId())
                .name(campaign.getName())
                .description(campaign.getDescription())
                .status(campaign.getStatus())
                .discountType(campaign.getDiscountType())
                .discountValue(campaign.getDiscountValue())
                .minimumBookingAmount(campaign.getMinimumBookingAmount())
                .maximumDiscountAmount(campaign.getMaximumDiscountAmount())
                .validFrom(campaign.getValidFrom())
                .validUntil(campaign.getValidUntil())
                .targetingMode(campaign.getTargetingMode())
                .targetAccountIds(parseTargetIds(campaign.getTargetAccountIdsCsv()))
                .couponQuantity(campaign.getCouponQuantity())
                .generatedCouponCount(generatedCouponCount)
                .usageLimitPerCoupon(campaign.getDefaultUsageLimitPerCoupon())
                .createdAt(campaign.getCreatedAt())
                .modifiedAt(campaign.getModifiedAt())
                .build();
    }

    public CouponResponse toCouponResponse(Coupon coupon) {
        return CouponResponse.builder()
                .id(coupon.getId())
                .campaignId(coupon.getCampaign().getId())
                .code(coupon.getCode())
                .status(coupon.getStatus())
                .usageLimit(coupon.getUsageLimit())
                .usageCount(coupon.getUsageCount())
                .eligibleAccountId(coupon.getEligibleAccount() != null ? coupon.getEligibleAccount().getId() : null)
                .expiresAt(coupon.getExpiresAt())
                .createdAt(coupon.getCreatedAt())
                .build();
    }

    public DiscountNotificationResponse toNotificationResponse(DiscountNotification notification, long unreadCount) {
        return toNotificationResponse(notification, unreadCount, notification.getCoupon());
    }

    public DiscountNotificationResponse toNotificationResponse(DiscountNotification notification, long unreadCount, Coupon coupon) {
        String couponCode = coupon != null ? coupon.getCode() : null;
        boolean read = notification.getReadStatus() == DiscountNotificationReadStatus.READ;
        return DiscountNotificationResponse.builder()
                .id(notification.getId())
                .campaignId(notification.getCampaign().getId())
                .title(notification.getCampaign().getName())
                .message(buildMessage(notification, couponCode))
                .couponCode(couponCode)
                .read(read)
                .validUntil(notification.getCampaign().getValidUntil())
                .createdAt(notification.getCreatedAt())
                .unreadCount(notification.getChannel() == DiscountNotificationChannel.IN_APP ? unreadCount : null)
                .build();
    }

    private String buildMessage(DiscountNotification notification, String couponCode) {
        String codeSuffix = couponCode != null ? " Use code " + couponCode + "." : "";
        return notification.getCampaign().getDescription() + codeSuffix;
    }

    private List<UUID> parseTargetIds(String csv) {
        if (csv == null || csv.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(csv.split(","))
                .filter(value -> !value.isBlank())
                .map(UUID::fromString)
                .toList();
    }
}
