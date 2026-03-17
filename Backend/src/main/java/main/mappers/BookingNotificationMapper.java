package main.mappers;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import org.springframework.stereotype.Component;

import main.dtos.response.BookingNotificationResponse;
import main.entities.BookingNotification;

@Component
public class BookingNotificationMapper {

    public BookingNotificationResponse toResponse(BookingNotification notification) {
        return BookingNotificationResponse.builder()
                .id(notification.getId())
                .eventType(notification.getEventType())
                .recipientEmail(notification.getRecipientEmail())
                .deliveryStatus(notification.getDeliveryStatus())
                .attemptCount(notification.getAttemptCount())
                .triggeredAt(notification.getTriggeredAt())
                .lastAttemptAt(notification.getLastAttemptAt())
                .sentAt(notification.getSentAt())
                .failureReason(notification.getFailureReason())
                .build();
    }

    public List<BookingNotificationResponse> toResponseList(List<BookingNotification> notifications) {
        return notifications.stream()
                .map(this::toResponse)
                .toList();
    }

    public LocalDateTime toLocalDateTime(java.time.Instant instant) {
        return instant == null ? null : LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }
}
