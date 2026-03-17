package com.swd392.carrentalsystem.services.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import main.dtos.response.AdminBookingResponse;
import main.dtos.response.BookingNotificationResponse;
import main.entities.Account;
import main.entities.Booking;
import main.entities.BookingNotification;
import main.enums.BookingNotificationEventType;
import main.enums.BookingStatus;
import main.mappers.BookingMapper;
import main.mappers.BookingNotificationMapper;
import main.repositories.AccountRepository;
import main.repositories.BookingCarRepository;
import main.repositories.BookingNotificationRepository;
import main.repositories.BookingRepository;
import main.repositories.CarRepository;
import main.repositories.CarTypeRepository;
import main.repositories.MediaFileRepository;
import main.repositories.PostTripInspectionRepository;
import main.services.BookingNotificationService;
import main.services.MediaFileService;
import main.services.PaymentTransactionService;
import main.services.impl.BookingServiceImpl;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private PaymentTransactionService paymentTransactionService;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private BookingMapper bookingMapper;
    @Mock
    private BookingCarRepository bookingCarRepository;
    @Mock
    private CarRepository carRepository;
    @Mock
    private CarTypeRepository carTypeRepository;
    @Mock
    private AccountRepository accountRepository;
    @Mock
    private BookingNotificationRepository bookingNotificationRepository;
    @Mock
    private PostTripInspectionRepository postTripInspectionRepository;
    @Mock
    private MediaFileRepository mediaFileRepository;
    @Mock
    private MediaFileService mediaFileService;
    @Mock
    private BookingNotificationService bookingNotificationService;
    @Mock
    private BookingNotificationMapper bookingNotificationMapper;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    void confirmPickup_ShouldSendPickupNotification() {
        Booking booking = buildBooking(BookingStatus.CONFIRMED);
        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingCarRepository.findByBookingId(booking.getId())).thenReturn(List.of());
        when(paymentTransactionService.getAllByBookingId(booking.getId())).thenReturn(List.of());
        when(bookingNotificationRepository.findByBooking_IdOrderByTriggeredAtDesc(booking.getId())).thenReturn(List.of());
        when(bookingNotificationMapper.toResponseList(List.of())).thenReturn(List.of());

        AdminBookingResponse response = bookingService.confirmPickup(booking.getId(), "handover complete");

        assertEquals(BookingStatus.IN_PROGRESS, booking.getStatus());
        assertNotNull(response);
        verify(bookingNotificationService).sendNotification(booking, BookingNotificationEventType.VEHICLE_PICKED_UP);
    }

    @Test
    void getAllBookings_ShouldIncludeNotificationHistoryInResponse() {
        Booking booking = buildBooking(BookingStatus.CONFIRMED);
        BookingNotification notification = BookingNotification.builder()
                .booking(booking)
                .eventType(BookingNotificationEventType.BOOKING_CONFIRMED)
                .build();
        BookingNotificationResponse notificationResponse = BookingNotificationResponse.builder()
                .eventType(BookingNotificationEventType.BOOKING_CONFIRMED)
                .build();

        when(bookingRepository.findAll(
                org.mockito.ArgumentMatchers.<Specification<Booking>>isNull(),
                any(Pageable.class)
        ))
                .thenReturn(new PageImpl<>(List.of(booking), PageRequest.of(0, 1), 1));
        when(bookingCarRepository.findByBookingId(booking.getId())).thenReturn(List.of());
        when(paymentTransactionService.getAllByBookingId(booking.getId())).thenReturn(List.of());
        when(bookingNotificationRepository.findByBooking_IdOrderByTriggeredAtDesc(booking.getId())).thenReturn(List.of(notification));
        when(bookingNotificationMapper.toResponseList(List.of(notification))).thenReturn(List.of(notificationResponse));

        var page = bookingService.getAllBookings(null, PageRequest.of(0, 10));

        assertEquals(1, page.getTotalElements());
        assertEquals(1, page.getContent().get(0).getNotifications().size());
        assertEquals(BookingNotificationEventType.BOOKING_CONFIRMED, page.getContent().get(0).getNotifications().get(0).getEventType());
    }

    @Test
    void confirmReturn_ShouldSendReturnNotification() {
        Booking booking = buildBooking(BookingStatus.IN_PROGRESS);
        booking.setExpectedReturnDate(LocalDateTime.now().plusHours(2));

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingCarRepository.findByBookingId(booking.getId())).thenReturn(List.of());
        when(paymentTransactionService.getAllByBookingId(booking.getId())).thenReturn(List.of());
        when(bookingNotificationRepository.findByBooking_IdOrderByTriggeredAtDesc(booking.getId())).thenReturn(List.of());
        when(bookingNotificationMapper.toResponseList(List.of())).thenReturn(List.of());

        AdminBookingResponse response = bookingService.confirmReturn(booking.getId(), "returned in good condition");

        assertNotNull(response);
        verify(bookingNotificationService).sendNotification(booking, BookingNotificationEventType.VEHICLE_RETURNED);
    }

    private Booking buildBooking(BookingStatus status) {
        Account account = new Account();
        account.setId(UUID.randomUUID());
        account.setName("Jane Doe");
        account.setEmail("jane@example.com");
        account.setPhone("0123456789");

        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setAccount(account);
        booking.setStatus(status);
        booking.setExpectedReceiveDate(LocalDateTime.now().plusHours(1));
        booking.setExpectedReturnDate(LocalDateTime.now().plusDays(1));
        booking.setBookingPrice(java.math.BigDecimal.valueOf(100));
        booking.setDepositAmount(java.math.BigDecimal.valueOf(30));
        booking.setRemainingAmount(java.math.BigDecimal.valueOf(70));
        booking.setTotalPrice(java.math.BigDecimal.valueOf(100));
        return booking;
    }
}
