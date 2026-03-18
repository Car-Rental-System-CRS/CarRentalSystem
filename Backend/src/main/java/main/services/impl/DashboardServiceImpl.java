package main.services.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import main.dtos.response.DashboardStatsResponse;
import main.dtos.response.DashboardStatsResponse.CampaignMetricsEmptyState;
import main.dtos.response.DashboardStatsResponse.CampaignPerformanceEntry;
import main.dtos.response.DashboardStatsResponse.CampaignTrendPoint;
import main.dtos.response.DashboardStatsResponse.CarTypeCount;
import main.dtos.response.DashboardStatsResponse.DailyCount;
import main.dtos.response.DashboardStatsResponse.DailyRevenue;
import main.dtos.response.DashboardStatsResponse.DiscountCampaignMetrics;
import main.dtos.response.DashboardStatsResponse.MonthlyCount;
import main.dtos.response.DashboardStatsResponse.RecentBooking;
import main.dtos.response.DashboardStatsResponse.RecentPayment;
import main.dtos.response.DashboardStatsResponse.ReportingPeriod;
import main.dtos.response.DashboardStatsResponse.StatusCount;
import main.dtos.response.DashboardStatsResponse.SummaryCard;
import main.entities.Booking;
import main.entities.BookingCar;
import main.entities.Coupon;
import main.entities.CouponRedemption;
import main.entities.DiscountCampaign;
import main.entities.PaymentTransaction;
import main.enums.CouponRedemptionStatus;
import main.enums.DiscountCampaignStatus;
import main.repositories.AccountRepository;
import main.repositories.BookingCarRepository;
import main.repositories.BookingRepository;
import main.repositories.CouponRedemptionRepository;
import main.repositories.CouponRepository;
import main.repositories.DiscountCampaignRepository;
import main.repositories.PaymentTransactionRepository;
import main.services.DashboardService;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardServiceImpl implements DashboardService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_INSTANT;
    private static final NumberFormat CURRENCY_FORMATTER = NumberFormat.getCurrencyInstance(Locale.US);
    private static final NumberFormat NUMBER_FORMATTER = NumberFormat.getNumberInstance(Locale.US);
    private static final Set<CouponRedemptionStatus> SUCCESSFUL_REDEMPTION_STATUSES = EnumSet.of(
            CouponRedemptionStatus.APPLIED,
            CouponRedemptionStatus.CONSUMED
    );

    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final BookingCarRepository bookingCarRepository;
    private final AccountRepository accountRepository;
    private final DiscountCampaignRepository discountCampaignRepository;
    private final CouponRepository couponRepository;
    private final CouponRedemptionRepository couponRedemptionRepository;

    @Override
    public DashboardStatsResponse getDashboardStats(Instant startDate, Instant endDate) {
        Instant previousEnd = startDate.minus(1, ChronoUnit.SECONDS);
        Instant previousStart = previousEnd.minus(ChronoUnit.MILLIS.between(startDate, endDate), ChronoUnit.MILLIS);

        List<DailyRevenue> revenueByDate = getRevenueByDate(startDate, endDate);
        List<StatusCount> bookingsByStatus = getBookingsByStatus(startDate, endDate);
        List<MonthlyCount> bookingsByMonth = getBookingsByMonth(startDate, endDate);
        List<CarTypeCount> topCarTypes = getTopCarTypes(startDate, endDate);
        List<StatusCount> paymentsByStatus = getPaymentsByStatus(startDate, endDate);
        List<DailyCount> userRegistrationsByDate = getUserRegistrationsByDate(startDate, endDate);
        List<RecentBooking> recentBookings = getRecentBookings(startDate, endDate);
        List<RecentPayment> recentPayments = getRecentPayments(startDate, endDate);

        DashboardSnapshot currentSnapshot = buildSnapshot(
                revenueByDate,
                bookingsByMonth,
                paymentsByStatus,
                userRegistrationsByDate
        );
        DashboardSnapshot previousSnapshot = buildSnapshot(
                getRevenueByDate(previousStart, previousEnd),
                getBookingsByMonth(previousStart, previousEnd),
                getPaymentsByStatus(previousStart, previousEnd),
                getUserRegistrationsByDate(previousStart, previousEnd)
        );

        DiscountCampaignMetrics campaignMetrics = buildDiscountCampaignMetrics(startDate, endDate, previousStart, previousEnd);

        return DashboardStatsResponse.builder()
                .reportingPeriod(buildReportingPeriod(startDate, endDate, previousStart, previousEnd))
                .summaryCards(buildSummaryCards(currentSnapshot, previousSnapshot))
                .revenueByDate(revenueByDate)
                .bookingsByStatus(bookingsByStatus)
                .bookingsByMonth(bookingsByMonth)
                .topCarTypes(topCarTypes)
                .paymentsByStatus(paymentsByStatus)
                .userRegistrationsByDate(userRegistrationsByDate)
                .recentBookings(recentBookings)
                .recentPayments(recentPayments)
                .discountCampaignMetrics(campaignMetrics)
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

    private String determineCampaignValueAttentionState(BigDecimal currentValue, BigDecimal previousValue) {
        if (currentValue.compareTo(BigDecimal.ZERO) == 0 && previousValue.compareTo(BigDecimal.ZERO) > 0) {
            return "WATCH";
        }
        if (currentValue.compareTo(previousValue) > 0) {
            return "NORMAL";
        }
        if (currentValue.compareTo(previousValue) < 0) {
            return "WATCH";
        }
        return "NORMAL";
    }

    private String determineRedemptionAttentionState(CampaignSnapshot snapshot) {
        if (snapshot.issuedCoupons() > 0 && snapshot.redeemedCoupons() == 0) {
            return "CRITICAL";
        }
        if (snapshot.issuedCoupons() > 0) {
            BigDecimal rate = BigDecimal.valueOf(snapshot.redeemedCoupons())
                    .divide(BigDecimal.valueOf(snapshot.issuedCoupons()), 4, RoundingMode.HALF_UP);
            if (rate.compareTo(BigDecimal.valueOf(0.1)) < 0) {
                return "WATCH";
            }
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
            List<DailyRevenue> revenueByDate,
            List<MonthlyCount> bookingsByMonth,
            List<StatusCount> paymentsByStatus,
            List<DailyCount> userRegistrationsByDate
    ) {
        BigDecimal revenue = revenueByDate.stream()
                .map(DailyRevenue::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long bookings = bookingsByMonth.stream()
                .mapToLong(MonthlyCount::getCount)
                .sum();

        long registrations = userRegistrationsByDate.stream()
                .mapToLong(DailyCount::getCount)
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

    private DiscountCampaignMetrics buildDiscountCampaignMetrics(
            Instant startDate,
            Instant endDate,
            Instant previousStart,
            Instant previousEnd
    ) {
        CampaignMetricsData currentMetrics = loadCampaignMetricsData(startDate, endDate);
        CampaignMetricsData previousMetrics = loadCampaignMetricsData(previousStart, previousEnd);

        CampaignSnapshot currentSnapshot = buildCampaignSnapshot(currentMetrics);
        CampaignSnapshot previousSnapshot = buildCampaignSnapshot(previousMetrics);

        return DiscountCampaignMetrics.builder()
                .summaryCards(buildCampaignSummaryCards(currentSnapshot, previousSnapshot))
                .redemptionTrend(buildCampaignTrend(currentMetrics, startDate, endDate))
                .campaignStatusDistribution(buildCampaignStatusDistribution(currentMetrics.campaigns()))
                .topCampaigns(buildCampaignPerformanceEntries(currentMetrics))
                .emptyState(buildCampaignEmptyState(currentSnapshot))
                .build();
    }

    private CampaignMetricsData loadCampaignMetricsData(Instant startDate, Instant endDate) {
        LocalDateTime periodStart = LocalDateTime.ofInstant(startDate, ZoneOffset.UTC);
        LocalDateTime periodEnd = LocalDateTime.ofInstant(endDate, ZoneOffset.UTC);

        List<DiscountCampaign> campaigns = discountCampaignRepository.findRelevantCampaignsForPeriod(
                periodStart,
                periodEnd,
                startDate,
                endDate
        );
        List<Coupon> issuedCoupons = couponRepository.findWithCampaignByCreatedAtBetween(startDate, endDate);
        List<CouponRedemption> redemptions = couponRedemptionRepository.findWithCampaignAndBookingByCreatedAtBetween(startDate, endDate)
                .stream()
                .filter(redemption -> SUCCESSFUL_REDEMPTION_STATUSES.contains(redemption.getStatus()))
                .collect(Collectors.toList());

        return new CampaignMetricsData(campaigns, issuedCoupons, redemptions);
    }

    private CampaignSnapshot buildCampaignSnapshot(CampaignMetricsData metricsData) {
        long activeCampaigns = metricsData.campaigns().stream()
                .filter(campaign -> campaign.getStatus() == DiscountCampaignStatus.ACTIVE)
                .count();

        long issuedCoupons = metricsData.issuedCoupons().size();
        long redeemedCoupons = metricsData.redemptions().size();

        Set<UUID> bookingIds = metricsData.redemptions().stream()
                .map(CouponRedemption::getBooking)
                .filter(booking -> booking != null && booking.getId() != null)
                .map(Booking::getId)
                .collect(Collectors.toSet());

        BigDecimal discountValueGranted = metricsData.redemptions().stream()
                .map(CouponRedemption::getDiscountAmount)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CampaignSnapshot(
                activeCampaigns,
                issuedCoupons,
                redeemedCoupons,
                bookingIds.size(),
                discountValueGranted
        );
    }

    private List<SummaryCard> buildCampaignSummaryCards(CampaignSnapshot current, CampaignSnapshot previous) {
        return List.of(
                buildSummaryCard(
                        "activeCampaigns",
                        "Active campaigns",
                        BigDecimal.valueOf(current.activeCampaigns()),
                        BigDecimal.valueOf(previous.activeCampaigns()),
                        determineCountAttentionState(current.activeCampaigns(), previous.activeCampaigns()),
                        false
                ),
                buildSummaryCard(
                        "issuedCoupons",
                        "Coupons issued",
                        BigDecimal.valueOf(current.issuedCoupons()),
                        BigDecimal.valueOf(previous.issuedCoupons()),
                        determineCountAttentionState(current.issuedCoupons(), previous.issuedCoupons()),
                        false
                ),
                buildSummaryCard(
                        "redeemedCoupons",
                        "Coupons redeemed",
                        BigDecimal.valueOf(current.redeemedCoupons()),
                        BigDecimal.valueOf(previous.redeemedCoupons()),
                        determineRedemptionAttentionState(current),
                        false
                ),
                buildSummaryCard(
                        "discountAttributedBookings",
                        "Discount bookings",
                        BigDecimal.valueOf(current.discountAttributedBookings()),
                        BigDecimal.valueOf(previous.discountAttributedBookings()),
                        determineCountAttentionState(
                                current.discountAttributedBookings(),
                                previous.discountAttributedBookings()
                        ),
                        false
                ),
                buildSummaryCard(
                        "discountValueGranted",
                        "Discount value granted",
                        current.discountValueGranted(),
                        previous.discountValueGranted(),
                        determineCampaignValueAttentionState(
                                current.discountValueGranted(),
                                previous.discountValueGranted()
                        ),
                        true
                )
        );
    }

    private CampaignMetricsEmptyState buildCampaignEmptyState(CampaignSnapshot snapshot) {
        boolean hasNoActivity = snapshot.activeCampaigns() == 0
                && snapshot.issuedCoupons() == 0
                && snapshot.redeemedCoupons() == 0
                && snapshot.discountAttributedBookings() == 0
                && snapshot.discountValueGranted().compareTo(BigDecimal.ZERO) == 0;

        if (!hasNoActivity) {
            return null;
        }

        return CampaignMetricsEmptyState.builder()
                .title("No campaign activity yet")
                .description("There were no discount campaigns, coupon issuances, or coupon redemptions in the selected reporting period.")
                .suggestedAction("Expand the reporting period or activate a campaign to populate this tab.")
                .build();
    }

    private List<CampaignTrendPoint> buildCampaignTrend(
            CampaignMetricsData metricsData,
            Instant startDate,
            Instant endDate
    ) {
        long days = ChronoUnit.DAYS.between(
                startDate.atZone(ZoneOffset.UTC).toLocalDate(),
                endDate.atZone(ZoneOffset.UTC).toLocalDate()
        ) + 1;
        boolean useDailyBuckets = days <= 31;

        Map<String, CampaignTrendAccumulator> buckets = initialiseTrendBuckets(startDate, endDate, useDailyBuckets);

        for (Coupon coupon : metricsData.issuedCoupons()) {
            String bucketKey = getTrendBucketKey(coupon.getCreatedAt(), useDailyBuckets);
            CampaignTrendAccumulator bucket = buckets.get(bucketKey);
            if (bucket != null) {
                bucket.incrementIssuedCoupons();
            }
        }

        for (CouponRedemption redemption : metricsData.redemptions()) {
            String bucketKey = getTrendBucketKey(getRedemptionEventInstant(redemption), useDailyBuckets);
            CampaignTrendAccumulator bucket = buckets.get(bucketKey);
            if (bucket != null) {
                bucket.incrementRedeemedCoupons();
                if (redemption.getBooking() != null && redemption.getBooking().getId() != null) {
                    bucket.addBooking(redemption.getBooking().getId());
                }
                if (redemption.getDiscountAmount() != null) {
                    bucket.addDiscountValue(redemption.getDiscountAmount());
                }
            }
        }

        return buckets.entrySet().stream()
                .map(entry -> entry.getValue().toDto(entry.getKey()))
                .collect(Collectors.toList());
    }

    private Map<String, CampaignTrendAccumulator> initialiseTrendBuckets(
            Instant startDate,
            Instant endDate,
            boolean useDailyBuckets
    ) {
        Map<String, CampaignTrendAccumulator> buckets = new LinkedHashMap<>();
        LocalDate start = startDate.atZone(ZoneOffset.UTC).toLocalDate();
        LocalDate end = endDate.atZone(ZoneOffset.UTC).toLocalDate();

        if (useDailyBuckets) {
            LocalDate cursor = start;
            while (!cursor.isAfter(end)) {
                buckets.put(cursor.toString(), new CampaignTrendAccumulator());
                cursor = cursor.plusDays(1);
            }
            return buckets;
        }

        YearMonth startMonth = YearMonth.from(start);
        YearMonth endMonth = YearMonth.from(end);
        YearMonth cursor = startMonth;
        while (!cursor.isAfter(endMonth)) {
            buckets.put(cursor.toString(), new CampaignTrendAccumulator());
            cursor = cursor.plusMonths(1);
        }
        return buckets;
    }

    private String getTrendBucketKey(Instant instant, boolean useDailyBuckets) {
        LocalDate utcDate = instant.atZone(ZoneOffset.UTC).toLocalDate();
        return useDailyBuckets ? utcDate.toString() : YearMonth.from(utcDate).toString();
    }

    private Instant getRedemptionEventInstant(CouponRedemption redemption) {
        if (redemption.getConsumedAt() != null) {
            return redemption.getConsumedAt().toInstant(ZoneOffset.UTC);
        }
        if (redemption.getValidatedAt() != null) {
            return redemption.getValidatedAt().toInstant(ZoneOffset.UTC);
        }
        return redemption.getCreatedAt();
    }

    private List<StatusCount> buildCampaignStatusDistribution(List<DiscountCampaign> campaigns) {
        Map<String, Long> counts = campaigns.stream()
                .collect(Collectors.groupingBy(
                        campaign -> campaign.getStatus().name(),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));

        return counts.entrySet().stream()
                .map(entry -> StatusCount.builder()
                        .status(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<CampaignPerformanceEntry> buildCampaignPerformanceEntries(CampaignMetricsData metricsData) {
        Map<UUID, CampaignPerformanceAccumulator> byCampaign = new LinkedHashMap<>();

        for (DiscountCampaign campaign : metricsData.campaigns()) {
            byCampaign.put(campaign.getId(), new CampaignPerformanceAccumulator(campaign));
        }

        for (Coupon coupon : metricsData.issuedCoupons()) {
            byCampaign.computeIfAbsent(
                    coupon.getCampaign().getId(),
                    unused -> new CampaignPerformanceAccumulator(coupon.getCampaign())
            ).incrementIssuedCoupons();
        }

        for (CouponRedemption redemption : metricsData.redemptions()) {
            byCampaign.computeIfAbsent(
                    redemption.getCampaign().getId(),
                    unused -> new CampaignPerformanceAccumulator(redemption.getCampaign())
            ).addRedemption(redemption);
        }

        return byCampaign.values().stream()
                .map(CampaignPerformanceAccumulator::toDto)
                .sorted((left, right) -> {
                    int valueComparison = right.getDiscountValueGranted().compareTo(left.getDiscountValueGranted());
                    if (valueComparison != 0) {
                        return valueComparison;
                    }
                    int redeemedComparison = Long.compare(right.getRedeemedCoupons(), left.getRedeemedCoupons());
                    if (redeemedComparison != 0) {
                        return redeemedComparison;
                    }
                    return Long.compare(right.getIssuedCoupons(), left.getIssuedCoupons());
                })
                .collect(Collectors.toList());
    }

    private List<DailyRevenue> getRevenueByDate(Instant start, Instant end) {
        return paymentTransactionRepository.revenueByDateBetween(start, end)
                .stream()
                .map(row -> DailyRevenue.builder()
                        .date((String) row[0])
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

    private List<DailyCount> getUserRegistrationsByDate(Instant start, Instant end) {
        return accountRepository.countRegistrationsByDateBetween(start, end)
                .stream()
                .map(row -> DailyCount.builder()
                        .date((String) row[0])
                        .count(((Number) row[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }

    private List<RecentBooking> getRecentBookings(Instant start, Instant end) {
        List<Booking> bookings = bookingRepository.findRecentBookings(start, end);
        return bookings.stream()
                .limit(5)
                .map(booking -> {
                    String carTypeName = "";
                    if (booking.getBookingCars() != null && !booking.getBookingCars().isEmpty()) {
                        BookingCar first = booking.getBookingCars().get(0);
                        if (first.getCar() != null && first.getCar().getCarType() != null) {
                            carTypeName = first.getCar().getCarType().getName();
                        }
                    }
                    return RecentBooking.builder()
                            .id(booking.getId().toString())
                            .customerName(booking.getAccount().getName())
                            .carTypeName(carTypeName)
                            .expectedReceiveDate(booking.getExpectedReceiveDate() != null ? booking.getExpectedReceiveDate().toString() : null)
                            .expectedReturnDate(booking.getExpectedReturnDate() != null ? booking.getExpectedReturnDate().toString() : null)
                            .totalPrice(booking.getTotalPrice())
                            .status(booking.getStatus().name())
                            .detailHref("/bookings/" + booking.getId())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<RecentPayment> getRecentPayments(Instant start, Instant end) {
        List<PaymentTransaction> payments = paymentTransactionRepository.findRecentPayments(start, end);
        return payments.stream()
                .limit(5)
                .map(payment -> RecentPayment.builder()
                        .id(payment.getId().toString())
                        .bookingId(payment.getBooking().getId().toString())
                        .amount(payment.getAmount())
                        .purpose(payment.getPurpose().name())
                        .status(payment.getStatus().name())
                        .createdAt(payment.getCreatedAt() != null ? payment.getCreatedAt().toString() : null)
                        .detailHref("/bookings/" + payment.getBooking().getId())
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

    private record CampaignSnapshot(
            long activeCampaigns,
            long issuedCoupons,
            long redeemedCoupons,
            long discountAttributedBookings,
            BigDecimal discountValueGranted
    ) {
    }

    private record CampaignMetricsData(
            List<DiscountCampaign> campaigns,
            List<Coupon> issuedCoupons,
            List<CouponRedemption> redemptions
    ) {
    }

    private static final class CampaignTrendAccumulator {
        private long issuedCoupons;
        private long redeemedCoupons;
        private final Set<UUID> bookingIds = new java.util.HashSet<>();
        private BigDecimal discountValueGranted = BigDecimal.ZERO;

        private void incrementIssuedCoupons() {
            issuedCoupons += 1;
        }

        private void incrementRedeemedCoupons() {
            redeemedCoupons += 1;
        }

        private void addBooking(UUID bookingId) {
            bookingIds.add(bookingId);
        }

        private void addDiscountValue(BigDecimal value) {
            discountValueGranted = discountValueGranted.add(value);
        }

        private CampaignTrendPoint toDto(String periodLabel) {
            return CampaignTrendPoint.builder()
                    .periodLabel(periodLabel)
                    .issuedCoupons(issuedCoupons)
                    .redeemedCoupons(redeemedCoupons)
                    .discountAttributedBookings(bookingIds.size())
                    .discountValueGranted(discountValueGranted)
                    .build();
        }
    }

    private static final class CampaignPerformanceAccumulator {
        private final DiscountCampaign campaign;
        private long issuedCoupons;
        private long redeemedCoupons;
        private final Set<UUID> bookingIds = new java.util.HashSet<>();
        private BigDecimal discountValueGranted = BigDecimal.ZERO;

        private CampaignPerformanceAccumulator(DiscountCampaign campaign) {
            this.campaign = campaign;
        }

        private void incrementIssuedCoupons() {
            issuedCoupons += 1;
        }

        private void addRedemption(CouponRedemption redemption) {
            redeemedCoupons += 1;
            if (redemption.getBooking() != null && redemption.getBooking().getId() != null) {
                bookingIds.add(redemption.getBooking().getId());
            }
            if (redemption.getDiscountAmount() != null) {
                discountValueGranted = discountValueGranted.add(redemption.getDiscountAmount());
            }
        }

        private CampaignPerformanceEntry toDto() {
            BigDecimal redemptionRate = null;
            if (issuedCoupons > 0) {
                redemptionRate = BigDecimal.valueOf(redeemedCoupons)
                        .divide(BigDecimal.valueOf(issuedCoupons), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(1, RoundingMode.HALF_UP);
            }

            return CampaignPerformanceEntry.builder()
                    .campaignId(campaign.getId().toString())
                    .campaignName(campaign.getName())
                    .status(campaign.getStatus().name())
                    .validFrom(campaign.getValidFrom() != null ? campaign.getValidFrom().toString() : null)
                    .validUntil(campaign.getValidUntil() != null ? campaign.getValidUntil().toString() : null)
                    .issuedCoupons(issuedCoupons)
                    .redeemedCoupons(redeemedCoupons)
                    .discountAttributedBookings(bookingIds.size())
                    .discountValueGranted(discountValueGranted)
                    .redemptionRate(redemptionRate)
                    .detailHref("/admin/discount-campaigns?campaignId=" + campaign.getId())
                    .build();
        }
    }
}
