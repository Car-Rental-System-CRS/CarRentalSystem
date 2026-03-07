package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.response.DashboardStatsResponse;
import main.dtos.response.DashboardStatsResponse.*;
import main.entities.Booking;
import main.entities.BookingCar;
import main.entities.PaymentTransaction;
import main.repositories.AccountRepository;
import main.repositories.BookingCarRepository;
import main.repositories.BookingRepository;
import main.repositories.PaymentTransactionRepository;
import main.services.DashboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final BookingCarRepository bookingCarRepository;
    private final AccountRepository accountRepository;

    @Override
    public DashboardStatsResponse getDashboardStats(Instant startDate, Instant endDate) {
        return DashboardStatsResponse.builder()
                .revenueByMonth(getRevenueByMonth(startDate, endDate))
                .bookingsByStatus(getBookingsByStatus(startDate, endDate))
                .bookingsByMonth(getBookingsByMonth(startDate, endDate))
                .topCarTypes(getTopCarTypes(startDate, endDate))
                .paymentsByStatus(getPaymentsByStatus(startDate, endDate))
                .userRegistrationsByMonth(getUserRegistrationsByMonth(startDate, endDate))
                .recentBookings(getRecentBookings(startDate, endDate))
                .recentPayments(getRecentPayments(startDate, endDate))
                .build();
    }

    private List<MonthlyRevenue> getRevenueByMonth(Instant start, Instant end) {
        return paymentTransactionRepository.revenueByMonthBetween(start, end)
                .stream()
                .map(row -> MonthlyRevenue.builder()
                        .month((String) row[0])
                        .revenue(row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO)
                        .build())
                .collect(Collectors.toList());
    }

    private List<StatusCount> getBookingsByStatus(Instant start, Instant end) {
        return bookingRepository.countByStatusBetween(start, end)
                .stream()
                .map(row -> StatusCount.builder()
                        .status(row[0].toString())
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<MonthlyCount> getBookingsByMonth(Instant start, Instant end) {
        return bookingRepository.countByMonthBetween(start, end)
                .stream()
                .map(row -> MonthlyCount.builder()
                        .month((String) row[0])
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<CarTypeCount> getTopCarTypes(Instant start, Instant end) {
        List<Object[]> results = bookingCarRepository.topCarTypesBetween(start, end);
        return results.stream()
                .limit(5)
                .map(row -> CarTypeCount.builder()
                        .carTypeName((String) row[0])
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<StatusCount> getPaymentsByStatus(Instant start, Instant end) {
        return paymentTransactionRepository.countByStatusBetween(start, end)
                .stream()
                .map(row -> StatusCount.builder()
                        .status(row[0].toString())
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<MonthlyCount> getUserRegistrationsByMonth(Instant start, Instant end) {
        return accountRepository.countRegistrationsByMonthBetween(start, end)
                .stream()
                .map(row -> MonthlyCount.builder()
                        .month((String) row[0])
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<RecentBooking> getRecentBookings(Instant start, Instant end) {
        List<Booking> bookings = bookingRepository.findRecentBookings(start, end);
        return bookings.stream()
                .limit(5)
                .map(b -> {
                    // Get first car type name from booking cars
                    String carTypeName = "";
                    if (b.getBookingCars() != null && !b.getBookingCars().isEmpty()) {
                        BookingCar first = b.getBookingCars().get(0);
                        if (first.getCar() != null && first.getCar().getCarType() != null) {
                            carTypeName = first.getCar().getCarType().getName();
                        }
                    }
                    return RecentBooking.builder()
                            .id(b.getId().toString())
                            .customerName(b.getAccount().getName())
                            .carTypeName(carTypeName)
                            .expectedReceiveDate(b.getExpectedReceiveDate() != null ? b.getExpectedReceiveDate().toString() : null)
                            .expectedReturnDate(b.getExpectedReturnDate() != null ? b.getExpectedReturnDate().toString() : null)
                            .totalPrice(b.getTotalPrice())
                            .status(b.getStatus().name())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<RecentPayment> getRecentPayments(Instant start, Instant end) {
        List<PaymentTransaction> payments = paymentTransactionRepository.findRecentPayments(start, end);
        return payments.stream()
                .limit(5)
                .map(pt -> RecentPayment.builder()
                        .id(pt.getId().toString())
                        .bookingId(pt.getBooking().getId().toString())
                        .amount(pt.getAmount())
                        .purpose(pt.getPurpose().name())
                        .status(pt.getStatus().name())
                        .build())
                .collect(Collectors.toList());
    }
}
