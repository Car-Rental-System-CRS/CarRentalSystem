package main.services;

import java.util.List;
import java.util.UUID;

import main.entities.Booking;
import main.entities.BookingNotification;
import main.enums.BookingNotificationEventType;

public interface BookingNotificationService {

    BookingNotification sendNotification(Booking booking, BookingNotificationEventType eventType);

    List<BookingNotification> getNotificationsForBooking(UUID bookingId);
}
