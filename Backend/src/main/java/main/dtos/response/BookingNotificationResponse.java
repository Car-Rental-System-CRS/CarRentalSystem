package main.dtos.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.enums.BookingNotificationDeliveryStatus;
import main.enums.BookingNotificationEventType;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingNotificationResponse {
    private UUID id;
    private BookingNotificationEventType eventType;
    private String recipientEmail;
    private BookingNotificationDeliveryStatus deliveryStatus;
    private Integer attemptCount;
    private LocalDateTime triggeredAt;
    private LocalDateTime lastAttemptAt;
    private LocalDateTime sentAt;
    private String failureReason;
}
