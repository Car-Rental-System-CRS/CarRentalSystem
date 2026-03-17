package main.dtos.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.enums.DiscountCampaignStatus;
import main.enums.DiscountCampaignTargetingMode;
import main.enums.DiscountType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountCampaignResponse {
    private UUID id;
    private String name;
    private String description;
    private DiscountCampaignStatus status;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minimumBookingAmount;
    private BigDecimal maximumDiscountAmount;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private DiscountCampaignTargetingMode targetingMode;
    private List<UUID> targetAccountIds;
    private Integer couponQuantity;
    private Integer generatedCouponCount;
    private Integer usageLimitPerCoupon;
    private Instant createdAt;
    private Instant modifiedAt;
}
