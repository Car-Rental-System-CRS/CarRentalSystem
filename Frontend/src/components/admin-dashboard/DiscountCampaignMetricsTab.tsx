'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { formatChartCurrency, formatCompactNumber } from '@/lib/dashboard';
import { DiscountCampaignMetrics } from '@/types/dashboard';
import { CampaignPerformanceList } from './CampaignPerformanceList';
import { DistributionSection } from './DistributionSection';
import { SummaryCards } from './SummaryCards';
import { TrendSection } from './TrendSection';

interface DiscountCampaignMetricsTabProps {
  metrics: DiscountCampaignMetrics;
}

const CAMPAIGN_STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#059669',
  PAUSED: '#d97706',
  DRAFT: '#64748b',
  EXPIRED: '#e11d48',
  ENDED: '#475569',
};

export function DiscountCampaignMetricsTab({ metrics }: DiscountCampaignMetricsTabProps) {
  return (
    <div className="space-y-6">
      <SummaryCards cards={metrics.summaryCards} />

      {metrics.emptyState && (
        <Card className="rounded-3xl border-dashed border-slate-300 bg-slate-50 shadow-sm">
          <CardHeader className="space-y-2">
            <CardTitle className="text-xl text-slate-900">{metrics.emptyState.title}</CardTitle>
            <CardDescription className="max-w-3xl text-sm text-slate-600">
              {metrics.emptyState.description}
            </CardDescription>
          </CardHeader>
          {metrics.emptyState.suggestedAction && (
            <CardContent className="pt-0 text-sm text-slate-500">
              {metrics.emptyState.suggestedAction}
            </CardContent>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <TrendSection
            title="Coupon usage trend"
            description="Track how coupon issuance and redemption move together across the selected period."
            emptyMessage="No coupon issuance or redemption activity in this reporting period."
            hasData={metrics.redemptionTrend.some((point) => point.issuedCoupons > 0 || point.redeemedCoupons > 0 || point.discountAttributedBookings > 0)}
          >
            <ResponsiveContainer height={320} width="100%">
              <LineChart data={metrics.redemptionTrend}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="periodLabel" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCompactNumber(Number(value))} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'discountValueGranted') {
                      return [formatChartCurrency(Number(value ?? 0)), 'Discount value'];
                    }

                    return [value, name];
                  }}
                  labelFormatter={(label, payload) => {
                    const point = payload?.[0]?.payload;
                    if (!point) {
                      return label;
                    }

                    return `${label} • Discount value ${formatChartCurrency(point.discountValueGranted ?? 0)}`;
                  }}
                />
                <Legend />
                <Line dataKey="issuedCoupons" name="Issued coupons" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} type="monotone" />
                <Line dataKey="redeemedCoupons" name="Redeemed coupons" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} type="monotone" />
                <Line dataKey="discountAttributedBookings" name="Discount bookings" stroke="#d97706" strokeWidth={2.5} dot={{ r: 3 }} type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </TrendSection>
        </div>

        <div className="xl:col-span-2">
          <DistributionSection
            title="Campaign status mix"
            description="See whether campaign performance is driven by active, paused, draft, or completed offers."
            emptyMessage="No campaign status data in this reporting period."
            hasData={metrics.campaignStatusDistribution.length > 0}
          >
            <ResponsiveContainer height={320} width="100%">
              <PieChart>
                <Pie
                  data={metrics.campaignStatusDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={104}
                  labelLine={false}
                >
                  {metrics.campaignStatusDistribution.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={CAMPAIGN_STATUS_COLORS[entry.status] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </DistributionSection>
        </div>
      </div>

      <CampaignPerformanceList entries={metrics.topCampaigns} />
    </div>
  );
}
