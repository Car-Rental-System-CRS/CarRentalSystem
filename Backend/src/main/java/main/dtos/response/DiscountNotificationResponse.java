package main.dtos.response;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountNotificationResponse {
    private UUID id;
    private UUID campaignId;
    private String title;
    private String message;
    private String couponCode;
    private boolean read;
    private LocalDateTime validUntil;
    private Instant createdAt;
    private Long unreadCount;
}
