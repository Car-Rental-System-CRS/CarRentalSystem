package com.swd392.carrentalsystem.services.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import main.dtos.response.DashboardStatsResponse;
import main.entities.Account;
import main.entities.Booking;
import main.entities.BookingCar;
import main.entities.Car;
import main.entities.CarType;
import main.entities.PaymentTransaction;
import main.enums.BookingStatus;
import main.enums.PaymentPurpose;
import main.enums.PaymentStatus;
import main.repositories.AccountRepository;
import main.repositories.BookingCarRepository;
import main.repositories.BookingRepository;
import main.repositories.PaymentTransactionRepository;
import main.services.impl.DashboardServiceImpl;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private BookingCarRepository bookingCarRepository;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @Test
    void getDashboardStats_ShouldReturnSummaryCardsPeriodLabelsAndDetailLinks() {
        UUID bookingId = UUID.randomUUID();
        UUID paymentId = UUID.randomUUID();

        when(paymentTransactionRepository.revenueByMonthBetween(any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{"2026-03", BigDecimal.valueOf(125000)}))
                .thenReturn(List.<Object[]>of(new Object[]{"2026-02", BigDecimal.valueOf(100000)}));
        when(bookingRepository.countByStatusBetween(any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{BookingStatus.CONFIRMED, 3L}));
        when(bookingRepository.countByMonthBetween(any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{"2026-03", 8L}))
                .thenReturn(List.<Object[]>of(new Object[]{"2026-02", 5L}));
        when(bookingCarRepository.topCarTypesBetween(any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{"SUV", 4L}));
        when(paymentTransactionRepository.countByStatusBetween(any(), any()))
                .thenReturn(List.<Object[]>of(
                        new Object[]{PaymentStatus.PAID, 6L},
                        new Object[]{PaymentStatus.PENDING, 1L}
                ))
                .thenReturn(List.<Object[]>of(new Object[]{PaymentStatus.PAID, 4L}));
        when(accountRepository.countRegistrationsByMonthBetween(any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{"2026-03", 4L}))
                .thenReturn(List.<Object[]>of(new Object[]{"2026-02", 2L}));
        when(bookingRepository.findRecentBookings(any(), any()))
                .thenReturn(List.of(buildBooking(bookingId, "Jane Doe", "SUV", BookingStatus.CONFIRMED)));
        when(paymentTransactionRepository.findRecentPayments(any(), any()))
                .thenReturn(List.of(buildPayment(paymentId, bookingId)));

        DashboardStatsResponse response = dashboardService.getDashboardStats(
                Instant.parse("2026-03-01T00:00:00Z"),
                Instant.parse("2026-03-31T23:59:59Z")
        );

        assertNotNull(response.getReportingPeriod());
        assertEquals("Last 30 days", response.getReportingPeriod().getLabel());
        assertEquals(4, response.getSummaryCards().size());
        assertEquals("Revenue", response.getSummaryCards().get(0).getTitle());
        assertEquals("UP", response.getSummaryCards().get(0).getComparisonDirection());
        assertEquals("/bookings/" + bookingId, response.getRecentBookings().get(0).getDetailHref());
        assertEquals("/bookings/" + bookingId, response.getRecentPayments().get(0).getDetailHref());
        assertEquals(paymentId.toString(), response.getRecentPayments().get(0).getId());
        assertEquals("2026-03-20T08:00:00Z", response.getRecentPayments().get(0).getCreatedAt());
    }

    @Test
    void getDashboardStats_ShouldMarkRevenueCriticalAndKeepCollectionsPopulated_WhenCurrentPeriodDropsToZero() {
        when(paymentTransactionRepository.revenueByMonthBetween(any(), any()))
                .thenReturn(List.of())
                .thenReturn(List.<Object[]>of(new Object[]{"2026-02", BigDecimal.valueOf(90000)}));
        when(bookingRepository.countByStatusBetween(any(), any()))
                .thenReturn(List.of());
        when(bookingRepository.countByMonthBetween(any(), any()))
                .thenReturn(List.of())
                .thenReturn(List.<Object[]>of(new Object[]{"2026-02", 3L}));
        when(bookingCarRepository.topCarTypesBetween(any(), any()))
                .thenReturn(List.of());
        when(paymentTransactionRepository.countByStatusBetween(any(), any()))
                .thenReturn(List.<Object[]>of(new Object[]{PaymentStatus.PENDING, 2L}))
                .thenReturn(List.<Object[]>of(new Object[]{PaymentStatus.PAID, 2L}));
        when(accountRepository.countRegistrationsByMonthBetween(any(), any()))
                .thenReturn(List.of())
                .thenReturn(List.<Object[]>of(new Object[]{"2026-02", 1L}));
        when(bookingRepository.findRecentBookings(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.findRecentPayments(any(), any())).thenReturn(List.of());

        DashboardStatsResponse response = dashboardService.getDashboardStats(
                Instant.parse("2026-03-01T00:00:00Z"),
                Instant.parse("2026-03-31T23:59:59Z")
        );

        assertFalse(response.getSummaryCards().isEmpty());
        assertEquals("CRITICAL", response.getSummaryCards().get(0).getAttentionState());
        assertTrue(response.getRecentBookings().isEmpty());
        assertTrue(response.getRecentPayments().isEmpty());
        assertNotNull(response.getReportingPeriod().getComparisonLabel());
    }

    private Booking buildBooking(UUID bookingId, String customerName, String carTypeName, BookingStatus status) {
        Account account = Account.builder()
                .id(UUID.randomUUID())
                .name(customerName)
                .email("jane@example.com")
                .password(new byte[]{1, 2, 3})
                .build();

        CarType carType = CarType.builder().name(carTypeName).build();
        Car car = Car.builder().carType(carType).build();
        BookingCar bookingCar = BookingCar.builder().car(car).build();

        Booking booking = Booking.builder()
                .id(bookingId)
                .account(account)
                .bookingCars(List.of(bookingCar))
                .expectedReceiveDate(LocalDateTime.of(2026, 3, 22, 9, 0))
                .expectedReturnDate(LocalDateTime.of(2026, 3, 26, 9, 0))
                .totalPrice(BigDecimal.valueOf(64000))
                .status(status)
                .build();
        bookingCar.setBooking(booking);
        return booking;
    }

    private PaymentTransaction buildPayment(UUID paymentId, UUID bookingId) {
        Booking booking = Booking.builder()
                .id(bookingId)
                .build();

        PaymentTransaction payment = PaymentTransaction.builder()
                .id(paymentId)
                .booking(booking)
                .amount(BigDecimal.valueOf(32000))
                .purpose(PaymentPurpose.BOOKING_PAYMENT)
                .status(PaymentStatus.PAID)
                .payOSPaymentCode(123L)
                .build();
        payment.setCreatedAt(Instant.parse("2026-03-20T08:00:00Z"));
        return payment;
    }
}
