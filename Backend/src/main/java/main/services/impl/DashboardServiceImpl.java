package main.services.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.text.NumberFormat;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import main.dtos.response.DashboardStatsResponse;
import main.dtos.response.DashboardStatsResponse.CarTypeCount;
import main.dtos.response.DashboardStatsResponse.MonthlyCount;
import main.dtos.response.DashboardStatsResponse.MonthlyRevenue;
import main.dtos.response.DashboardStatsResponse.RecentBooking;
import main.dtos.response.DashboardStatsResponse.RecentPayment;
import main.dtos.response.DashboardStatsResponse.ReportingPeriod;
import main.dtos.response.DashboardStatsResponse.StatusCount;
import main.dtos.response.DashboardStatsResponse.SummaryCard;
import main.entities.Booking;
import main.entities.BookingCar;
import main.entities.PaymentTransaction;
import main.repositories.AccountRepository;
import main.repositories.BookingCarRepository;
import main.repositories.BookingRepository;
import main.repositories.PaymentTransactionRepository;
import main.services.DashboardService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_INSTANT;
    private static final NumberFormat CURRENCY_FORMATTER = NumberFormat.getCurrencyInstance(Locale.US);
    private static final NumberFormat NUMBER_FORMATTER = NumberFormat.getNumberInstance(Locale.US);

    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final BookingCarRepository bookingCarRepository;
    private final AccountRepository accountRepository;

    @Override
    public DashboardStatsResponse getDashboardStats(Instant startDate, Instant endDate) {
        Instant previousEnd = startDate.minus(1, ChronoUnit.SECONDS);
        Instant previousStart = previousEnd.minus(ChronoUnit.MILLIS.between(startDate, endDate), ChronoUnit.MILLIS);

        List<MonthlyRevenue> revenueByMonth = getRevenueByMonth(startDate, endDate);
        List<StatusCount> bookingsByStatus = getBookingsByStatus(startDate, endDate);
        List<MonthlyCount> bookingsByMonth = getBookingsByMonth(startDate, endDate);
        List<CarTypeCount> topCarTypes = getTopCarTypes(startDate, endDate);
        List<StatusCount> paymentsByStatus = getPaymentsByStatus(startDate, endDate);
        List<MonthlyCount> userRegistrationsByMonth = getUserRegistrationsByMonth(startDate, endDate);
        List<RecentBooking> recentBookings = getRecentBookings(startDate, endDate);
        List<RecentPayment> recentPayments = getRecentPayments(startDate, endDate);

        DashboardSnapshot currentSnapshot = buildSnapshot(
                revenueByMonth,
                bookingsByMonth,
                paymentsByStatus,
                userRegistrationsByMonth
        );
        DashboardSnapshot previousSnapshot = buildSnapshot(
                getRevenueByMonth(previousStart, previousEnd),
                getBookingsByMonth(previousStart, previousEnd),
                getPaymentsByStatus(previousStart, previousEnd),
                getUserRegistrationsByMonth(previousStart, previousEnd)
        );

        return DashboardStatsResponse.builder()
                .reportingPeriod(buildReportingPeriod(startDate, endDate, previousStart, previousEnd))
                .summaryCards(buildSummaryCards(currentSnapshot, previousSnapshot))
                .revenueByMonth(revenueByMonth)
                .bookingsByStatus(bookingsByStatus)
                .bookingsByMonth(bookingsByMonth)
                .topCarTypes(topCarTypes)
                .paymentsByStatus(paymentsByStatus)
                .userRegistrationsByMonth(userRegistrationsByMonth)
                .recentBookings(recentBookings)
                .recentPayments(recentPayments)
                .build();
    }

    private ReportingPeriod buildReportingPeriod(
            Instant startDate,
            Instant endDate,
            Instant previousStart,
            Instant previousEnd
    ) {
        return ReportingPeriod.builder()
                .label(buildRangeLabel(startDate, endDate))
                .startDate(DATE_FORMATTER.format(startDate))
                .endDate(DATE_FORMATTER.format(endDate))
                .comparisonLabel(buildRangeLabel(previousStart, previousEnd))
                .build();
    }

    private String buildRangeLabel(Instant startDate, Instant endDate) {
        long days = ChronoUnit.DAYS.between(
                startDate.atZone(ZoneOffset.UTC).toLocalDate(),
                endDate.atZone(ZoneOffset.UTC).toLocalDate()
        ) + 1;

        if (days <= 7) {
            return "Last 7 days";
        }
        if (days <= 31) {
            return "Last 30 days";
        }
        if (days <= 92) {
            return "Last 3 months";
        }
        if (days <= 184) {
            return "Last 6 months";
        }
        if (days <= 370) {
            return "Last 12 months";
        }

        return startDate.atZone(ZoneOffset.UTC).toLocalDate() + " to "
                + endDate.atZone(ZoneOffset.UTC).toLocalDate();
    }

    private List<SummaryCard> buildSummaryCards(DashboardSnapshot current, DashboardSnapshot previous) {
        return List.of(
                buildSummaryCard(
                        "revenue",
                        "Revenue",
                        current.revenue(),
                        previous.revenue(),
                        determineRevenueAttentionState(current.revenue(), previous.revenue()),
                        true
                ),
                buildSummaryCard(
                        "bookings",
                        "Bookings created",
                        BigDecimal.valueOf(current.bookings()),
                        BigDecimal.valueOf(previous.bookings()),
                        determineCountAttentionState(current.bookings(), previous.bookings()),
                        false
                ),
                buildSummaryCard(
                        "paidPayments",
                        "Paid payments",
                        BigDecimal.valueOf(current.paidPayments()),
                        BigDecimal.valueOf(previous.paidPayments()),
                        determinePaymentAttentionState(current.paidPayments(), current.pendingPayments()),
                        false
                ),
                buildSummaryCard(
                        "customers",
                        "New customers",
                        BigDecimal.valueOf(current.registrations()),
                        BigDecimal.valueOf(previous.registrations()),
                        determineCountAttentionState(current.registrations(), previous.registrations()),
                        false
                )
        );
    }

    private SummaryCard buildSummaryCard(
            String key,
            String title,
            BigDecimal currentValue,
            BigDecimal previousValue,
            String attentionState,
            boolean currency
    ) {
        String direction = determineComparisonDirection(currentValue, previousValue);
        return SummaryCard.builder()
                .key(key)
                .title(title)
                .value(currentValue)
                .valueDisplay(currency ? formatCurrency(currentValue) : formatNumber(currentValue))
                .comparisonValue(previousValue)
                .comparisonDirection(direction)
                .comparisonDeltaDisplay(buildComparisonDelta(currentValue, previousValue, direction))
                .attentionState(attentionState)
                .supportingLabel("vs previous comparable period")
                .build();
    }

    private String determineComparisonDirection(BigDecimal currentValue, BigDecimal previousValue) {
        int comparison = currentValue.compareTo(previousValue);
        if (comparison > 0) {
            return "UP";
        }
        if (comparison < 0) {
            return "DOWN";
        }
        return "FLAT";
    }

    private String buildComparisonDelta(BigDecimal currentValue, BigDecimal previousValue, String direction) {
        if (previousValue.compareTo(BigDecimal.ZERO) == 0) {
            if (currentValue.compareTo(BigDecimal.ZERO) == 0) {
                return "0%";
            }
            return "New";
        }

        BigDecimal percent = currentValue.subtract(previousValue)
                .divide(previousValue, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));

        String prefix = "UP".equals(direction) ? "+" : "";
        return prefix + percent.setScale(1, RoundingMode.HALF_UP) + "%";
    }

    private String determineRevenueAttentionState(BigDecimal currentValue, BigDecimal previousValue) {
        if (currentValue.compareTo(BigDecimal.ZERO) == 0 && previousValue.compareTo(BigDecimal.ZERO) > 0) {
            return "CRITICAL";
        }
        if (previousValue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal ratio = currentValue.divide(previousValue, 4, RoundingMode.HALF_UP);
            if (ratio.compareTo(BigDecimal.valueOf(0.5)) < 0) {
                return "CRITICAL";
            }
            if (ratio.compareTo(BigDecimal.valueOf(0.8)) < 0) {
                return "WATCH";
            }
        }
        return "NORMAL";
    }

    private String determineCountAttentionState(long currentValue, long previousValue) {
        if (currentValue == 0 && previousValue > 0) {
            return "WATCH";
        }
        if (previousValue > 0 && currentValue < previousValue / 2) {
            return "WATCH";
        }
        return "NORMAL";
    }

    private String determinePaymentAttentionState(long paidPayments, long pendingPayments) {
        if (paidPayments == 0 && pendingPayments > 0) {
            return "CRITICAL";
        }
        if (pendingPayments > paidPayments) {
            return "WATCH";
        }
        return "NORMAL";
    }

    private String formatCurrency(BigDecimal value) {
        synchronized (CURRENCY_FORMATTER) {
            return CURRENCY_FORMATTER.format(value);
        }
    }

    private String formatNumber(BigDecimal value) {
        synchronized (NUMBER_FORMATTER) {
            return NUMBER_FORMATTER.format(value);
        }
    }

    private DashboardSnapshot buildSnapshot(
            List<MonthlyRevenue> revenueByMonth,
            List<MonthlyCount> bookingsByMonth,
            List<StatusCount> paymentsByStatus,
            List<MonthlyCount> userRegistrationsByMonth
    ) {
        BigDecimal revenue = revenueByMonth.stream()
                .map(MonthlyRevenue::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long bookings = bookingsByMonth.stream()
                .mapToLong(MonthlyCount::getCount)
                .sum();

        long registrations = userRegistrationsByMonth.stream()
                .mapToLong(MonthlyCount::getCount)
                .sum();

        long paidPayments = findStatusCount(paymentsByStatus, "PAID");
        long pendingPayments = findStatusCount(paymentsByStatus, "PENDING");

        return new DashboardSnapshot(revenue, bookings, paidPayments, pendingPayments, registrations);
    }

    private long findStatusCount(List<StatusCount> statuses, String status) {
        return statuses.stream()
                .filter(item -> status.equals(item.getStatus()))
                .mapToLong(StatusCount::getCount)
                .sum();
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
                            .detailHref("/bookings/" + b.getId())
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
                        .createdAt(pt.getCreatedAt() != null ? pt.getCreatedAt().toString() : null)
                        .detailHref("/bookings/" + pt.getBooking().getId())
                        .build())
                .collect(Collectors.toList());
    }

    private record DashboardSnapshot(
            BigDecimal revenue,
            long bookings,
            long paidPayments,
            long pendingPayments,
            long registrations
    ) {
    }
}
