export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export type ComparisonDirection = 'UP' | 'DOWN' | 'FLAT' | 'UNAVAILABLE';
export type AttentionState = 'NORMAL' | 'WATCH' | 'CRITICAL';

export interface StatusCount {
  status: string;
  count: number;
}

export interface MonthlyCount {
  month: string;
  count: number;
}

export interface CarTypeCount {
  carTypeName: string;
  count: number;
}

export interface RecentBooking {
  id: string;
  customerName: string;
  carTypeName: string;
  expectedReceiveDate: string | null;
  expectedReturnDate: string | null;
  totalPrice: number;
  status: string;
  detailHref: string;
}

export interface RecentPayment {
  id: string;
  bookingId: string;
  amount: number;
  purpose: string;
  status: string;
  createdAt: string | null;
  detailHref: string;
}

export interface ReportingPeriod {
  label: string;
  startDate: string;
  endDate: string;
  comparisonLabel: string | null;
}

export interface DashboardSummaryCard {
  key: string;
  title: string;
  value: number;
  valueDisplay: string;
  comparisonValue: number | null;
  comparisonDirection: ComparisonDirection;
  comparisonDeltaDisplay: string | null;
  attentionState: AttentionState;
  supportingLabel: string;
}

export interface CampaignTrendPoint {
  periodLabel: string;
  issuedCoupons: number;
  redeemedCoupons: number;
  discountAttributedBookings: number;
  discountValueGranted: number;
}

export interface CampaignPerformanceEntry {
  campaignId: string;
  campaignName: string;
  status: string;
  validFrom: string | null;
  validUntil: string | null;
  issuedCoupons: number;
  redeemedCoupons: number;
  discountAttributedBookings: number;
  discountValueGranted: number;
  redemptionRate: number | null;
  detailHref: string;
}

export interface CampaignMetricsEmptyState {
  title: string;
  description: string;
  suggestedAction: string | null;
}

export interface DiscountCampaignMetrics {
  summaryCards: DashboardSummaryCard[];
  redemptionTrend: CampaignTrendPoint[];
  campaignStatusDistribution: StatusCount[];
  topCampaigns: CampaignPerformanceEntry[];
  emptyState: CampaignMetricsEmptyState | null;
}

export interface DashboardStats {
  reportingPeriod: ReportingPeriod;
  summaryCards: DashboardSummaryCard[];
  revenueByMonth: MonthlyRevenue[];
  bookingsByStatus: StatusCount[];
  bookingsByMonth: MonthlyCount[];
  topCarTypes: CarTypeCount[];
  paymentsByStatus: StatusCount[];
  userRegistrationsByMonth: MonthlyCount[];
  recentBookings: RecentBooking[];
  recentPayments: RecentPayment[];
  discountCampaignMetrics: DiscountCampaignMetrics;
}
