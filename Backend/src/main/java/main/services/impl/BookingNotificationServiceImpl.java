package main.services.impl;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.entities.Account;
import main.entities.Booking;
import main.entities.BookingCar;
import main.entities.BookingNotification;
import main.enums.BookingNotificationDeliveryStatus;
import main.enums.BookingNotificationEventType;
import main.repositories.BookingCarRepository;
import main.repositories.BookingNotificationRepository;
import main.services.BookingNotificationService;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingNotificationServiceImpl implements BookingNotificationService {

    private static final DateTimeFormatter EMAIL_TIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final String TEMPLATE_VERSION = "v1";

    private final BookingNotificationRepository bookingNotificationRepository;
    private final BookingCarRepository bookingCarRepository;
    private final JavaMailSender javaMailSender;

    @Value("${app.mail.from-address:}")
    private String fromAddress;

    @Value("${app.mail.from-name:Car Rental System}")
    private String fromName;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Override
    @Transactional
    public BookingNotification sendNotification(Booking booking, BookingNotificationEventType eventType) {
        UUID bookingId = booking.getId();
        return bookingNotificationRepository.findByBooking_IdAndEventType(bookingId, eventType)
                .orElseGet(() -> createAndSendNotification(booking, eventType));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingNotification> getNotificationsForBooking(UUID bookingId) {
        return bookingNotificationRepository.findByBooking_IdOrderByTriggeredAtDesc(bookingId);
    }

    private BookingNotification createAndSendNotification(Booking booking, BookingNotificationEventType eventType) {
        LocalDateTime triggeredAt = resolveTriggeredAt(booking, eventType);
        Account renter = booking.getAccount();
        String recipientEmail = renter != null ? renter.getEmail() : null;

        BookingNotification notification = BookingNotification.builder()
                .booking(booking)
                .eventType(eventType)
                .recipientEmail(recipientEmail)
                .deliveryStatus(BookingNotificationDeliveryStatus.PENDING)
                .attemptCount(0)
                .triggeredAt(triggeredAt)
                .templateVersion(TEMPLATE_VERSION)
                .build();
        bookingNotificationRepository.save(notification);

        if (!StringUtils.hasText(recipientEmail)) {
            notification.setDeliveryStatus(BookingNotificationDeliveryStatus.SKIPPED);
            notification.setFailureReason("Recipient email is missing");
            return bookingNotificationRepository.save(notification);
        }

        notification.setAttemptCount(notification.getAttemptCount() + 1);
        notification.setLastAttemptAt(LocalDateTime.now());

        try {
            SimpleMailMessage message = buildMailMessage(booking, eventType, recipientEmail);
            javaMailSender.send(message);
            notification.setDeliveryStatus(BookingNotificationDeliveryStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notification.setFailureReason(null);
        } catch (MailException | IllegalStateException ex) {
            log.warn("Failed to send {} notification for booking {}: {}", eventType, booking.getId(), ex.getMessage());
            notification.setDeliveryStatus(BookingNotificationDeliveryStatus.FAILED);
            notification.setFailureReason(ex.getMessage());
        }

        return bookingNotificationRepository.save(notification);
    }

    private SimpleMailMessage buildMailMessage(Booking booking, BookingNotificationEventType eventType, String recipientEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipientEmail);
        if (StringUtils.hasText(fromAddress)) {
            message.setFrom(StringUtils.hasText(fromName) ? fromName + " <" + fromAddress + ">" : fromAddress);
        }
        message.setSubject(buildSubject(eventType, booking));
        message.setText(buildBody(booking, eventType));
        return message;
    }

    private String buildSubject(BookingNotificationEventType eventType, Booking booking) {
        return switch (eventType) {
            case BOOKING_CONFIRMED -> "Booking confirmed for " + booking.getId();
            case VEHICLE_PICKED_UP -> "Vehicle pickup confirmed for booking " + booking.getId();
            case VEHICLE_RETURNED -> "Vehicle return confirmed for booking " + booking.getId();
            case OVERDUE_WARNING -> "Overdue return warning for booking " + booking.getId();
            case BOOKING_COMPLETED -> "Booking completed for " + booking.getId();
        };
    }

    private String buildBody(Booking booking, BookingNotificationEventType eventType) {
        String renterName = booking.getAccount() != null && StringUtils.hasText(booking.getAccount().getName())
                ? booking.getAccount().getName()
                : "Renter";
        String bookingLink = frontendBaseUrl + "/bookings/" + booking.getId();
        String vehicleSummary = buildVehicleSummary(booking);
        String rentalPeriod = formatRange(booking.getExpectedReceiveDate(), booking.getExpectedReturnDate());

        String eventSummary = switch (eventType) {
            case BOOKING_CONFIRMED -> "Your deposit payment was received and your booking is now confirmed.";
            case VEHICLE_PICKED_UP -> "Your vehicle pickup has been recorded successfully.";
            case VEHICLE_RETURNED -> "Your vehicle return has been recorded successfully.";
            case OVERDUE_WARNING -> "Your vehicle return is overdue. Please return the vehicle as soon as possible to avoid further charges.";
            case BOOKING_COMPLETED -> "Your final payment was received and the booking is now complete.";
        };

        return """
                Hello %s,

                %s

                Booking ID: %s
                Vehicle(s): %s
                Rental period: %s
                Pickup notes: %s
                Return notes: %s

                View booking details: %s

                Regards,
                Car Rental System
                """.formatted(
                renterName,
                eventSummary,
                booking.getId(),
                vehicleSummary,
                rentalPeriod,
                defaultText(booking.getPickupNotes()),
                defaultText(booking.getReturnNotes()),
                bookingLink
        );
    }

    private String buildVehicleSummary(Booking booking) {
        List<BookingCar> bookingCars = bookingCarRepository.findByBookingId(booking.getId());
        if (bookingCars.isEmpty()) {
            return "Vehicle details unavailable";
        }

        return bookingCars.stream()
                .map(bookingCar -> {
                    var car = bookingCar.getCar();
                    if (car == null || car.getCarType() == null) {
                        return "Unknown vehicle";
                    }
                    return car.getCarType().getCarBrand().getName() + " "
                            + car.getCarType().getName()
                            + " (" + car.getLicensePlate() + ")";
                })
                .distinct()
                .reduce((left, right) -> left + ", " + right)
                .orElse("Vehicle details unavailable");
    }

    private LocalDateTime resolveTriggeredAt(Booking booking, BookingNotificationEventType eventType) {
        return switch (eventType) {
            case BOOKING_CONFIRMED -> LocalDateTime.now();
            case VEHICLE_PICKED_UP -> booking.getActualReceiveDate() != null ? booking.getActualReceiveDate() : LocalDateTime.now();
            case VEHICLE_RETURNED -> booking.getActualReturnDate() != null ? booking.getActualReturnDate() : LocalDateTime.now();
            case OVERDUE_WARNING -> LocalDateTime.now();
            case BOOKING_COMPLETED -> LocalDateTime.now();
        };
    }

    private String formatRange(LocalDateTime start, LocalDateTime end) {
        return defaultText(start != null ? start.format(EMAIL_TIME_FORMAT) : null)
                + " -> "
                + defaultText(end != null ? end.format(EMAIL_TIME_FORMAT) : null);
    }

    private String defaultText(String value) {
        return StringUtils.hasText(value) ? value : "N/A";
    }
}
