package main.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import main.entities.BookingNotification;
import main.enums.BookingNotificationEventType;

public interface BookingNotificationRepository extends JpaRepository<BookingNotification, UUID> {

    Optional<BookingNotification> findByBooking_IdAndEventType(UUID bookingId, BookingNotificationEventType eventType);

    List<BookingNotification> findByBooking_IdOrderByTriggeredAtDesc(UUID bookingId);
}
