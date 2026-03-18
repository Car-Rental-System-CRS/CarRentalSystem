package main.services.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import main.dtos.response.DashboardStatsResponse;
import main.dtos.response.DashboardStatsResponse.CampaignPerformanceEntry;
import main.dtos.response.DashboardStatsResponse.SummaryCard;
import main.entities.Booking;
import main.entities.Coupon;
import main.entities.CouponRedemption;
import main.entities.DiscountCampaign;
import main.enums.BookingStatus;
import main.enums.CouponRedemptionStatus;
import main.enums.CouponStatus;
import main.enums.DiscountCampaignStatus;
import main.enums.DiscountCampaignTargetingMode;
import main.enums.DiscountType;
import main.repositories.AccountRepository;
import main.repositories.BookingCarRepository;
import main.repositories.BookingRepository;
import main.repositories.CouponRedemptionRepository;
import main.repositories.CouponRepository;
import main.repositories.DiscountCampaignRepository;
import main.repositories.PaymentTransactionRepository;

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

    @Mock
    private DiscountCampaignRepository discountCampaignRepository;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private CouponRedemptionRepository couponRedemptionRepository;

    private DashboardServiceImpl dashboardService;

    @BeforeEach
    void setUp() {
        dashboardService = new DashboardServiceImpl(
                bookingRepository,
                paymentTransactionRepository,
                bookingCarRepository,
                accountRepository,
                discountCampaignRepository,
                couponRepository,
                couponRedemptionRepository
        );

        stubCoreDashboardData();
    }

    @Test
    void shouldReturnCampaignEmptyStateWhenNoCampaignActivityExists() {
        Instant start = Instant.parse("2026-01-01T00:00:00Z");
        Instant end = Instant.parse("2026-01-31T23:59:59Z");

        stubCampaignData(start, end, List.of(), List.of(), List.of(), List.of(), List.of(), List.of());

        DashboardStatsResponse response = dashboardService.getDashboardStats(start, end);

        assertNotNull(response.getDiscountCampaignMetrics());
        assertNotNull(response.getDiscountCampaignMetrics().getEmptyState());
        assertEquals("No campaign activity yet", response.getDiscountCampaignMetrics().getEmptyState().getTitle());
        assertEquals(5, response.getDiscountCampaignMetrics().getSummaryCards().size());
        assertEquals(BigDecimal.ZERO, findSummaryCard(response, "issuedCoupons").getValue());
    }

    @Test
    void shouldAggregateCampaignSummaryTrendAndDrillDownEntries() {
        Instant start = Instant.parse("2026-02-01T00:00:00Z");
        Instant end = Instant.parse("2026-02-28T23:59:59Z");

        DiscountCampaign currentCampaign = buildCampaign(
                UUID.fromString("11111111-1111-1111-1111-111111111111"),
                "Spring Saver",
                DiscountCampaignStatus.ACTIVE,
                "2026-01-20T09:00:00Z"
        );
        Coupon currentCoupon = buildCoupon(
                UUID.fromString("22222222-2222-2222-2222-222222222222"),
                currentCampaign,
                "SPRING25",
                "2026-02-10T10:00:00Z"
        );
        Booking booking = Booking.builder()
                .id(UUID.fromString("33333333-3333-3333-3333-333333333333"))
                .status(BookingStatus.CREATED)
                .build();
        CouponRedemption currentRedemption = buildRedemption(
                UUID.fromString("44444444-4444-4444-4444-444444444444"),
                currentCampaign,
                currentCoupon,
                booking,
                BigDecimal.valueOf(25),
                "2026-02-14T08:15:00Z"
        );

        stubCampaignData(
                start,
                end,
                List.of(currentCampaign),
                List.of(currentCoupon),
                List.of(currentRedemption),
                List.of(),
                List.of(),
                List.of()
        );

        DashboardStatsResponse response = dashboardService.getDashboardStats(start, end);

        SummaryCard redeemedCard = findSummaryCard(response, "redeemedCoupons");
        CampaignPerformanceEntry topCampaign = response.getDiscountCampaignMetrics().getTopCampaigns().get(0);

        assertEquals(BigDecimal.ONE, redeemedCard.getValue());
        assertEquals("UP", redeemedCard.getComparisonDirection());
        assertNull(response.getDiscountCampaignMetrics().getEmptyState());
        assertTrue(response.getDiscountCampaignMetrics().getRedemptionTrend().stream()
                .anyMatch(point -> point.getRedeemedCoupons() == 1 && point.getDiscountAttributedBookings() == 1));
        assertEquals("Spring Saver", topCampaign.getCampaignName());
        assertEquals(1L, topCampaign.getRedeemedCoupons());
        assertEquals("/admin/discount-campaigns?campaignId=11111111-1111-1111-1111-111111111111", topCampaign.getDetailHref());
    }

    @Test
    void shouldCompareCampaignSummaryCardsAgainstPreviousPeriod() {
        Instant start = Instant.parse("2026-03-01T00:00:00Z");
        Instant end = Instant.parse("2026-03-31T23:59:59Z");

        DiscountCampaign campaign = buildCampaign(
                UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                "March Push",
                DiscountCampaignStatus.ACTIVE,
                "2026-02-15T09:00:00Z"
        );

        Coupon currentCouponOne = buildCoupon(
                UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
                campaign,
                "MARCH10",
                "2026-03-05T10:00:00Z"
        );
        Coupon currentCouponTwo = buildCoupon(
                UUID.fromString("cccccccc-cccc-cccc-cccc-cccccccccccc"),
                campaign,
                "MARCH20",
                "2026-03-06T10:00:00Z"
        );
        Coupon previousCoupon = buildCoupon(
                UUID.fromString("dddddddd-dddd-dddd-dddd-dddddddddddd"),
                campaign,
                "FEB10",
                "2026-02-10T10:00:00Z"
        );

        stubCampaignData(
                start,
                end,
                List.of(campaign),
                List.of(currentCouponOne, currentCouponTwo),
                List.of(),
                List.of(campaign),
                List.of(previousCoupon),
                List.of()
        );

        DashboardStatsResponse response = dashboardService.getDashboardStats(start, end);

        SummaryCard issuedCard = findSummaryCard(response, "issuedCoupons");

        assertEquals(BigDecimal.valueOf(2), issuedCard.getValue());
        assertEquals(BigDecimal.ONE, issuedCard.getComparisonValue());
        assertEquals("UP", issuedCard.getComparisonDirection());
        assertEquals("+100.0%", issuedCard.getComparisonDeltaDisplay());
    }

    private void stubCoreDashboardData() {
        when(paymentTransactionRepository.revenueByDateBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.countByMonthBetween(any(), any())).thenReturn(List.of());
        when(bookingCarRepository.topCarTypesBetween(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.countByStatusBetween(any(), any())).thenReturn(List.of());
        when(accountRepository.countRegistrationsByDateBetween(any(), any())).thenReturn(List.of());
        when(bookingRepository.findRecentBookings(any(), any())).thenReturn(List.of());
        when(paymentTransactionRepository.findRecentPayments(any(), any())).thenReturn(List.of());
    }

    private void stubCampaignData(
            Instant start,
            Instant end,
            List<DiscountCampaign> currentCampaigns,
            List<Coupon> currentCoupons,
            List<CouponRedemption> currentRedemptions,
            List<DiscountCampaign> previousCampaigns,
            List<Coupon> previousCoupons,
            List<CouponRedemption> previousRedemptions
    ) {
        Instant previousEnd = start.minus(1, ChronoUnit.SECONDS);
        Instant previousStart = previousEnd.minus(ChronoUnit.MILLIS.between(start, end), ChronoUnit.MILLIS);

        when(discountCampaignRepository.findRelevantCampaignsForPeriod(any(), any(), any(), any()))
                .thenAnswer(invocation -> {
                    Instant invocationStart = invocation.getArgument(2);
                    if (start.equals(invocationStart)) {
                        return currentCampaigns;
                    }
                    if (previousStart.equals(invocationStart)) {
                        return previousCampaigns;
                    }
                    return List.of();
                });

        when(couponRepository.findWithCampaignByCreatedAtBetween(any(), any()))
                .thenAnswer(invocation -> {
                    Instant invocationStart = invocation.getArgument(0);
                    if (start.equals(invocationStart)) {
                        return currentCoupons;
                    }
                    if (previousStart.equals(invocationStart)) {
                        return previousCoupons;
                    }
                    return List.of();
                });

        when(couponRedemptionRepository.findWithCampaignAndBookingByCreatedAtBetween(any(), any()))
                .thenAnswer(invocation -> {
                    Instant invocationStart = invocation.getArgument(0);
                    if (start.equals(invocationStart)) {
                        return currentRedemptions;
                    }
                    if (previousStart.equals(invocationStart)) {
                        return previousRedemptions;
                    }
                    return List.of();
                });
    }

    private DiscountCampaign buildCampaign(UUID id, String name, DiscountCampaignStatus status, String createdAt) {
        DiscountCampaign campaign = DiscountCampaign.builder()
                .id(id)
                .name(name)
                .description(name + " description")
                .status(status)
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(BigDecimal.TEN)
                .minimumBookingAmount(BigDecimal.ZERO)
                .maximumDiscountAmount(BigDecimal.valueOf(50))
                .validFrom(LocalDateTime.ofInstant(Instant.parse(createdAt), ZoneOffset.UTC).minusDays(1))
                .validUntil(LocalDateTime.ofInstant(Instant.parse(createdAt), ZoneOffset.UTC).plusDays(30))
                .targetingMode(DiscountCampaignTargetingMode.ALL_RENTERS)
                .couponQuantity(100)
                .defaultUsageLimitPerCoupon(1)
                .build();
        campaign.setCreatedAt(Instant.parse(createdAt));
        return campaign;
    }

    private Coupon buildCoupon(UUID id, DiscountCampaign campaign, String code, String createdAt) {
        Coupon coupon = Coupon.builder()
                .id(id)
                .campaign(campaign)
                .code(code)
                .status(CouponStatus.AVAILABLE)
                .usageLimit(1)
                .usageCount(0)
                .build();
        coupon.setCreatedAt(Instant.parse(createdAt));
        return coupon;
    }

    private CouponRedemption buildRedemption(
            UUID id,
            DiscountCampaign campaign,
            Coupon coupon,
            Booking booking,
            BigDecimal discountAmount,
            String createdAt
    ) {
        CouponRedemption redemption = CouponRedemption.builder()
                .id(id)
                .campaign(campaign)
                .coupon(coupon)
                .booking(booking)
                .status(CouponRedemptionStatus.CONSUMED)
                .discountAmount(discountAmount)
                .consumedAt(LocalDateTime.ofInstant(Instant.parse(createdAt), ZoneOffset.UTC))
                .build();
        redemption.setCreatedAt(Instant.parse(createdAt));
        return redemption;
    }

    private SummaryCard findSummaryCard(DashboardStatsResponse response, String key) {
        return response.getDiscountCampaignMetrics().getSummaryCards().stream()
                .filter(card -> key.equals(card.getKey()))
                .findFirst()
                .orElseThrow();
    }
}
