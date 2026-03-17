package main.dtos.response;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.enums.CouponStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponResponse {
    private UUID id;
    private UUID campaignId;
    private String code;
    private CouponStatus status;
    private Integer usageLimit;
    private Integer usageCount;
    private UUID eligibleAccountId;
    private LocalDateTime expiresAt;
    private Instant createdAt;
}
