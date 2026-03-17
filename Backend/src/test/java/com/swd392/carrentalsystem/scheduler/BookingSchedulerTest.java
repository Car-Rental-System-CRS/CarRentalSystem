package com.swd392.carrentalsystem.scheduler;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import main.entities.Booking;
import main.enums.BookingNotificationEventType;
import main.enums.BookingStatus;
import main.repositories.BookingRepository;
import main.scheduler.BookingScheduler;
import main.services.BookingNotificationService;

@ExtendWith(MockitoExtension.class)
class BookingSchedulerTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingNotificationService bookingNotificationService;

    @InjectMocks
    private BookingScheduler bookingScheduler;

    @Test
    void notifyOverdueReturns_ShouldSendWarningForEachOverdueBooking() {
        Booking first = new Booking();
        first.setId(UUID.randomUUID());
        Booking second = new Booking();
        second.setId(UUID.randomUUID());

        when(bookingRepository.findBookingsByStatusBeforeReturnCutoff(org.mockito.ArgumentMatchers.eq(BookingStatus.IN_PROGRESS), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of(first, second));

        bookingScheduler.notifyOverdueReturns();

        verify(bookingNotificationService, times(1)).sendNotification(first, BookingNotificationEventType.OVERDUE_WARNING);
        verify(bookingNotificationService, times(1)).sendNotification(second, BookingNotificationEventType.OVERDUE_WARNING);
    }
}
