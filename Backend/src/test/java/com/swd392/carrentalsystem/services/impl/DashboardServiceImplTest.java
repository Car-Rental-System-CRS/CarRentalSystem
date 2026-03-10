package com.swd392.carrentalsystem.services.impl;

import main.dtos.response.DashboardStatsResponse;
import main.dtos.response.DashboardStatsResponse.*;
import main.entities.*;
import main.repositories.AccountRepository;
import main.repositories.BookingCarRepository;
import main.repositories.BookingRepository;
import main.repositories.PaymentTransactionRepository;
import main.services.impl.DashboardServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private PaymentTransactionRepository paymentTransactionRepository;
    @Mock private BookingCarRepository bookingCarRepository;
    @Mock private AccountRepository accountRepository;

    @InjectMocks
    private DashboardServiceImpl service;

    private final Instant START = Instant.parse("2026-01-01T00:00:00Z");
    private final Instant END   = Instant.parse("2026-12-31T23:59:59Z");

    // ---------------------------
    // revenueByMonth
    // ---------------------------

    @Test
    void getDashboardStats_RevenueByMonth_MapsMonthAndRevenueWithNullAsZero() {
        when(paymentTransactionRepository.revenueByMonthBetween(START, END))
                .thenReturn(List.of(
                        new Object[]{"2026-01", new BigDecimal("1500000")},
                        new Object[]{"2026-02", null}
                ));
        // keep other repositories unused
        when(bookingRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingCarRepository.topCarTypesBetween(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(accountRepository.countRegistrationsByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.findRecentBookings(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.findRecentPayments(any(), any())).thenReturn(List.of());

        DashboardStatsResponse res = service.getDashboardStats(START, END);

        assertEquals(2, res.getRevenueByMonth().size());
        assertEquals("2026-01", res.getRevenueByMonth().get(0).getMonth());
        assertEquals(new BigDecimal("1500000"), res.getRevenueByMonth().get(0).getRevenue());
        assertEquals("2026-02", res.getRevenueByMonth().get(1).getMonth());
        assertEquals(BigDecimal.ZERO, res.getRevenueByMonth().get(1).getRevenue());
    }

    // ---------------------------
    // bookingsByStatus
    // ---------------------------

    @Test
    void getDashboardStats_BookingsByStatus_MapsStatusAndCount() {
        when(bookingRepository.countByStatusBetween(START, END))
                .thenReturn(List.of(
                        new Object[]{"CREATED", 5},
                        new Object[]{"CONFIRMED", 7L}
                ));
        when(paymentTransactionRepository.revenueByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingCarRepository.topCarTypesBetween(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(accountRepository.countRegistrationsByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.findRecentBookings(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.findRecentPayments(any(), any())).thenReturn(List.of());

        DashboardStatsResponse res = service.getDashboardStats(START, END);

        assertEquals(2, res.getBookingsByStatus().size());
        assertEquals("CREATED", res.getBookingsByStatus().get(0).getStatus());
        assertEquals(5L, res.getBookingsByStatus().get(0).getCount());
        assertEquals("CONFIRMED", res.getBookingsByStatus().get(1).getStatus());
        assertEquals(7L, res.getBookingsByStatus().get(1).getCount());
    }

    // ---------------------------
    // bookingsByMonth
    // ---------------------------

    @Test
    void getDashboardStats_BookingsByMonth_MapsMonthAndCount() {
        when(bookingRepository.countByMonthBetween(START, END))
                .thenReturn(List.of(
                        new Object[]{"2026-01", 10},
                        new Object[]{"2026-02", 12L}
                ));
        when(paymentTransactionRepository.revenueByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(bookingCarRepository.topCarTypesBetween(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(accountRepository.countRegistrationsByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.findRecentBookings(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.findRecentPayments(any(), any())).thenReturn(List.of());

        DashboardStatsResponse res = service.getDashboardStats(START, END);

        assertEquals(2, res.getBookingsByMonth().size());
        assertEquals("2026-01", res.getBookingsByMonth().get(0).getMonth());
        assertEquals(10L, res.getBookingsByMonth().get(0).getCount());
        assertEquals("2026-02", res.getBookingsByMonth().get(1).getMonth());
        assertEquals(12L, res.getBookingsByMonth().get(1).getCount());
    }

    // ---------------------------
    // topCarTypes (limit 5)
    // ---------------------------

    @Test
    void getDashboardStats_TopCarTypes_MapsNameAndCount_WithLimitFive() {
        when(bookingCarRepository.topCarTypesBetween(START, END))
                .thenReturn(List.of(
                        new Object[]{"SUV", 8},
                        new Object[]{"Sedan", 6},
                        new Object[]{"Hatchback", 4},
                        new Object[]{"Truck", 3},
                        new Object[]{"Van", 2},
                        new Object[]{"Coupe", 1}
                ));
        when(paymentTransactionRepository.revenueByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByMonthBetween(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(accountRepository.countRegistrationsByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.findRecentBookings(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.findRecentPayments(any(), any())).thenReturn(List.of());

        DashboardStatsResponse res = service.getDashboardStats(START, END);

        assertEquals(5, res.getTopCarTypes().size());
        assertEquals("SUV", res.getTopCarTypes().get(0).getCarTypeName());
        assertEquals(8L, res.getTopCarTypes().get(0).getCount());
        assertEquals("Van", res.getTopCarTypes().get(4).getCarTypeName());
        assertEquals(2L, res.getTopCarTypes().get(4).getCount());
    }

    // ---------------------------
    // paymentsByStatus
    // ---------------------------

    @Test
    void getDashboardStats_PaymentsByStatus_MapsStatusAndCount() {
        when(paymentTransactionRepository.countByStatusBetween(START, END))
                .thenReturn(List.of(
                        new Object[]{"PENDING", 3},
                        new Object[]{"PAID", 9}
                ));
        when(paymentTransactionRepository.revenueByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingCarRepository.topCarTypesBetween(any(), any())).thenReturn(List.of());
        when(accountRepository.countRegistrationsByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.findRecentBookings(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.findRecentPayments(any(), any())).thenReturn(List.of());

        DashboardStatsResponse res = service.getDashboardStats(START, END);

        assertEquals(2, res.getPaymentsByStatus().size());
        assertEquals("PENDING", res.getPaymentsByStatus().get(0).getStatus());
        assertEquals(3L, res.getPaymentsByStatus().get(0).getCount());
        assertEquals("PAID", res.getPaymentsByStatus().get(1).getStatus());
        assertEquals(9L, res.getPaymentsByStatus().get(1).getCount());
    }

    // ---------------------------
    // userRegistrationsByMonth
    // ---------------------------

    @Test
    void getDashboardStats_UserRegistrationsByMonth_MapsMonthAndCount() {
        when(accountRepository.countRegistrationsByMonthBetween(START, END))
                .thenReturn(List.of(
                        new Object[]{"2026-01", 20},
                        new Object[]{"2026-02", 25}
                ));
        when(paymentTransactionRepository.revenueByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingCarRepository.topCarTypesBetween(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.findRecentBookings(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.findRecentPayments(any(), any())).thenReturn(List.of());

        DashboardStatsResponse res = service.getDashboardStats(START, END);

        assertEquals(2, res.getUserRegistrationsByMonth().size());
        assertEquals("2026-01", res.getUserRegistrationsByMonth().get(0).getMonth());
        assertEquals(20L, res.getUserRegistrationsByMonth().get(0).getCount());
        assertEquals("2026-02", res.getUserRegistrationsByMonth().get(1).getMonth());
        assertEquals(25L, res.getUserRegistrationsByMonth().get(1).getCount());
    }

    // ---------------------------
    // recentBookings
    // ---------------------------

    @Test
    void getDashboardStats_RecentBookings_MapsNestedFieldsAndNullSafety() {
        Booking booking1 = new Booking();
        booking1.setId(UUID.randomUUID());
        Account acc1 = new Account();
        acc1.setName("Alice");
        booking1.setAccount(acc1);
        booking1.setExpectedReceiveDate(LocalDateTime.parse("2026-03-01T09:00:00"));
        booking1.setExpectedReturnDate(LocalDateTime.parse("2026-03-02T09:00:00"));
        booking1.setTotalPrice(new BigDecimal("2400000"));
        booking1.setStatus(main.enums.BookingStatus.CONFIRMED);

        BookingCar bc1 = new BookingCar();
        Car car1 = new Car();
        CarType type1 = new CarType();
        type1.setName("SUV");
        car1.setCarType(type1);
        bc1.setCar(car1);
        booking1.setBookingCars(List.of(bc1));

        Booking booking2 = new Booking();
        booking2.setId(UUID.randomUUID());
        Account acc2 = new Account();
        acc2.setName("Bob");
        booking2.setAccount(acc2);
        booking2.setExpectedReceiveDate(null);
        booking2.setExpectedReturnDate(null);
        booking2.setTotalPrice(new BigDecimal("1000000"));
        booking2.setStatus(main.enums.BookingStatus.CREATED);
        booking2.setBookingCars(List.of());

        when(bookingRepository.findRecentBookings(START, END))
                .thenReturn(List.of(booking1, booking2));

        when(paymentTransactionRepository.revenueByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingCarRepository.topCarTypesBetween(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(accountRepository.countRegistrationsByMonthBetween(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.findRecentPayments(any(), any())).thenReturn(List.of());

        DashboardStatsResponse res = service.getDashboardStats(START, END);

        assertEquals(2, res.getRecentBookings().size());

        RecentBooking rb1 = res.getRecentBookings().get(0);
        assertEquals("Alice", rb1.getCustomerName());
        assertEquals("SUV", rb1.getCarTypeName());
        assertEquals("CONFIRMED", rb1.getStatus());
        assertEquals(new BigDecimal("2400000"), rb1.getTotalPrice());
        assertEquals("2026-03-01T09:00", rb1.getExpectedReceiveDate());
        assertEquals("2026-03-02T09:00", rb1.getExpectedReturnDate());

        RecentBooking rb2 = res.getRecentBookings().get(1);
        assertEquals("Bob", rb2.getCustomerName());
        assertEquals("", rb2.getCarTypeName());
        assertEquals("CREATED", rb2.getStatus());
        assertEquals(new BigDecimal("1000000"), rb2.getTotalPrice());
        assertNull(rb2.getExpectedReceiveDate());
        assertNull(rb2.getExpectedReturnDate());
    }

    // ---------------------------
    // recentPayments
    // ---------------------------

    @Test
    void getDashboardStats_RecentPayments_MapsAllFields() {
        Booking booking1 = new Booking();
        booking1.setId(UUID.randomUUID());

        Booking booking2 = new Booking();
        booking2.setId(UUID.randomUUID());

        PaymentTransaction pt1 = PaymentTransaction.builder()
                .id(UUID.randomUUID())
                .booking(booking1)
                .amount(new BigDecimal("720000"))
                .purpose(main.enums.PaymentPurpose.BOOKING_PAYMENT)
                .status(main.enums.PaymentStatus.PAID)
                .build();

        PaymentTransaction pt2 = PaymentTransaction.builder()
                .id(UUID.randomUUID())
                .booking(booking2)
                .amount(new BigDecimal("300000"))
                .purpose(main.enums.PaymentPurpose.OVERDUE_PAYMENT)
                .status(main.enums.PaymentStatus.PENDING)
                .build();

        when(paymentTransactionRepository.findRecentPayments(START, END))
                .thenReturn(List.of(pt1, pt2));

        when(paymentTransactionRepository.revenueByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingCarRepository.topCarTypesBetween(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(accountRepository.countRegistrationsByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.findRecentBookings(any(), any())).thenReturn(List.of());

        DashboardStatsResponse res = service.getDashboardStats(START, END);

        assertEquals(2, res.getRecentPayments().size());

        RecentPayment rp1 = res.getRecentPayments().get(0);
        assertEquals(pt1.getId().toString(), rp1.getId());
        assertEquals(booking1.getId().toString(), rp1.getBookingId());
        assertEquals(new BigDecimal("720000"), rp1.getAmount());
        assertEquals("BOOKING_PAYMENT", rp1.getPurpose());
        assertEquals("PAID", rp1.getStatus());

        RecentPayment rp2 = res.getRecentPayments().get(1);
        assertEquals(pt2.getId().toString(), rp2.getId());
        assertEquals(booking2.getId().toString(), rp2.getBookingId());
        assertEquals(new BigDecimal("300000"), rp2.getAmount());
        assertEquals("OVERDUE_PAYMENT", rp2.getPurpose());
        assertEquals("PENDING", rp2.getStatus());
    }
}
