package main.dtos.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsResponse {

    private List<MonthlyRevenue> revenueByMonth;
    private List<StatusCount> bookingsByStatus;
    private List<MonthlyCount> bookingsByMonth;
    private List<CarTypeCount> topCarTypes;
    private List<StatusCount> paymentsByStatus;
    private List<MonthlyCount> userRegistrationsByMonth;
    private List<RecentBooking> recentBookings;
    private List<RecentPayment> recentPayments;

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyRevenue {
        private String month;       // e.g. "2026-01"
        private BigDecimal revenue;
    }

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StatusCount {
        private String status;
        private long count;
    }

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyCount {
        private String month;       // e.g. "2026-01"
        private long count;
    }

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CarTypeCount {
        private String carTypeName;
        private long count;
    }

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentBooking {
        private String id;
        private String customerName;
        private String carTypeName;
        private String expectedReceiveDate;
        private String expectedReturnDate;
        private BigDecimal totalPrice;
        private String status;
    }

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RecentPayment {
        private String id;
        private String bookingId;
        private BigDecimal amount;
        private String purpose;
        private String status;
        private String createdAt;
    }
}
