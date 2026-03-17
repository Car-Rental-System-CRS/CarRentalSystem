package com.swd392.carrentalsystem.services.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import main.entities.Account;
import main.entities.Booking;
import main.entities.BookingNotification;
import main.enums.BookingNotificationDeliveryStatus;
import main.enums.BookingNotificationEventType;
import main.repositories.BookingCarRepository;
import main.repositories.BookingNotificationRepository;
import main.services.impl.BookingNotificationServiceImpl;

@ExtendWith(MockitoExtension.class)
class BookingNotificationServiceImplTest {

    @Mock
    private BookingNotificationRepository bookingNotificationRepository;

    @Mock
    private BookingCarRepository bookingCarRepository;

    @Mock
    private JavaMailSender javaMailSender;

    @InjectMocks
    private BookingNotificationServiceImpl bookingNotificationService;

    @Test
    void sendNotification_ShouldMarkNotificationSent_WhenMailSucceeds() {
        Booking booking = buildBooking("renter@example.com");
        when(bookingNotificationRepository.findByBooking_IdAndEventType(booking.getId(), BookingNotificationEventType.BOOKING_CONFIRMED))
                .thenReturn(Optional.empty());
        when(bookingNotificationRepository.save(any(BookingNotification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(bookingCarRepository.findByBookingId(booking.getId())).thenReturn(List.of());

        ReflectionTestUtils.setField(bookingNotificationService, "frontendBaseUrl", "http://localhost:3000");

        BookingNotification result = bookingNotificationService.sendNotification(
                booking,
                BookingNotificationEventType.BOOKING_CONFIRMED
        );

        assertEquals(BookingNotificationDeliveryStatus.SENT, result.getDeliveryStatus());
        assertEquals(1, result.getAttemptCount());
        verify(javaMailSender).send(any(org.springframework.mail.SimpleMailMessage.class));
    }

    @Test
    void sendNotification_ShouldSkipNotification_WhenRecipientEmailMissing() {
        Booking booking = buildBooking(null);
        when(bookingNotificationRepository.findByBooking_IdAndEventType(booking.getId(), BookingNotificationEventType.OVERDUE_WARNING))
                .thenReturn(Optional.empty());
        when(bookingNotificationRepository.save(any(BookingNotification.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        BookingNotification result = bookingNotificationService.sendNotification(
                booking,
                BookingNotificationEventType.OVERDUE_WARNING
        );

        assertEquals(BookingNotificationDeliveryStatus.SKIPPED, result.getDeliveryStatus());
        assertEquals("Recipient email is missing", result.getFailureReason());
        verify(javaMailSender, never()).send(any(org.springframework.mail.SimpleMailMessage.class));
    }

    @Test
    void sendNotification_ShouldReturnExistingNotification_WhenEventAlreadyRecorded() {
        Booking booking = buildBooking("renter@example.com");
        BookingNotification existing = BookingNotification.builder()
                .booking(booking)
                .eventType(BookingNotificationEventType.VEHICLE_PICKED_UP)
                .deliveryStatus(BookingNotificationDeliveryStatus.SENT)
                .attemptCount(1)
                .triggeredAt(LocalDateTime.now())
                .build();

        when(bookingNotificationRepository.findByBooking_IdAndEventType(booking.getId(), BookingNotificationEventType.VEHICLE_PICKED_UP))
                .thenReturn(Optional.of(existing));

        BookingNotification result = bookingNotificationService.sendNotification(
                booking,
                BookingNotificationEventType.VEHICLE_PICKED_UP
        );

        assertSame(existing, result);
        verify(bookingNotificationRepository, never()).save(any(BookingNotification.class));
        verify(javaMailSender, never()).send(any(org.springframework.mail.SimpleMailMessage.class));
    }

    private Booking buildBooking(String email) {
        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setName("Renter");
        account.setEmail(email);

        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setAccount(account);
        booking.setExpectedReceiveDate(LocalDateTime.now().plusDays(1));
        booking.setExpectedReturnDate(LocalDateTime.now().plusDays(2));
        return booking;
    }
}
