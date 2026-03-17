'use client';

import { useCallback, useEffect, useState } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DateRange } from 'react-day-picker';
import { Loader2 } from 'lucide-react';

import { DashboardHeader, PresetRange } from '@/components/admin-dashboard/DashboardHeader';
import { DistributionSection } from '@/components/admin-dashboard/DistributionSection';
import { RecentBookingsPanel } from '@/components/admin-dashboard/RecentBookingsPanel';
import { RecentPaymentsPanel } from '@/components/admin-dashboard/RecentPaymentsPanel';
import { SummaryCards } from '@/components/admin-dashboard/SummaryCards';
import { TrendSection } from '@/components/admin-dashboard/TrendSection';
import { Button } from '@/components/ui/Button';
import { dashboardService } from '@/services/dashboardService';
import {
  formatChartCurrency,
  formatCompactNumber,
  formatCurrency,
} from '@/lib/dashboard';
import { DashboardStats } from '@/types/dashboard';

const BOOKING_STATUS_COLORS: Record<string, string> = {
  CREATED: '#4f46e5',
  CONFIRMED: '#0284c7',
  IN_PROGRESS: '#d97706',
  COMPLETED: '#059669',
  CANCELED: '#e11d48',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: '#d97706',
  PAID: '#059669',
  CANCELLED: '#e11d48',
  EXPIRED: '#64748b',
};

function getPresetDates(preset: PresetRange): { start: Date; end: Date } | null {
  const now = new Date();

  switch (preset) {
    case '7d':
      return { start: subDays(now, 7), end: now };
    case '30d':
      return { start: subDays(now, 30), end: now };
    case '3m':
      return { start: subMonths(now, 3), end: now };
    case '6m':
      return { start: subMonths(now, 6), end: now };
    case '12m':
      return { start: subMonths(now, 12), end: now };
    case 'all':
      return { start: new Date('2000-01-01T00:00:00.000Z'), end: now };
    case 'custom':
      return null;
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preset, setPreset] = useState<PresetRange>('12m');
  const [customRange, setCustomRange] = useState<DateRange | undefined>();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (preset === 'custom' && customRange?.from) {
        startDate = customRange.from.toISOString();
        endDate = (customRange.to ?? new Date()).toISOString();
      } else if (preset !== 'all') {
        const dates = getPresetDates(preset);
        if (dates) {
          startDate = dates.start.toISOString();
          endDate = dates.end.toISOString();
        }
      }

      const data = await dashboardService.getStats({ startDate, endDate });
      setStats(data);
    } catch (fetchError) {
      console.error(fetchError);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [customRange, preset]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading && !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-rose-600">{error}</p>
        <Button onClick={fetchDashboard} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
        onPresetChange={setPreset}
        preset={preset}
        reportingPeriod={stats.reportingPeriod}
      />

      {error && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Showing the last successful dashboard snapshot. Refresh failed with:
          {' '}
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
          Refreshing dashboard for
          {' '}
          {stats.reportingPeriod.label.toLowerCase()}
          ...
        </div>
      )}

      <SummaryCards cards={stats.summaryCards} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <TrendSection
            description="Track revenue performance over the selected reporting period."
            emptyMessage="No revenue activity in this reporting period."
            hasData={stats.revenueByMonth.length > 0}
            title="Revenue trend"
          >
            <ResponsiveContainer height={320} width="100%">
              <AreaChart data={stats.revenueByMonth}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCompactNumber(value)}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), 'Revenue']}
                />
                <Area
                  dataKey="revenue"
                  fill="url(#revenueGradient)"
                  stroke="#0f766e"
                  strokeWidth={2.5}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TrendSection>
        </div>

        <div className="xl:col-span-2">
          <DistributionSection
            description="Check whether booking lifecycle states are balanced or drifting."
            emptyMessage="No booking status data in this reporting period."
            hasData={stats.bookingsByStatus.length > 0}
            title="Booking distribution"
          >
            <ResponsiveContainer height={320} width="100%">
              <PieChart>
                <Pie
                  data={stats.bookingsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={104}
                  labelLine={false}
                >
                  {stats.bookingsByStatus.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={BOOKING_STATUS_COLORS[entry.status] || '#64748b'}
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <TrendSection
            description="Monitor booking volume across the same reporting window."
            emptyMessage="No booking volume data in this reporting period."
            hasData={stats.bookingsByMonth.length > 0}
            title="Booking creation trend"
          >
            <ResponsiveContainer height={320} width="100%">
              <BarChart data={stats.bookingsByMonth}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1d4ed8" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TrendSection>
        </div>

        <div className="xl:col-span-2">
          <TrendSection
            description="See which vehicle categories are driving booking concentration."
            emptyMessage="No car type demand data in this reporting period."
            hasData={stats.topCarTypes.length > 0}
            title="Top car types"
          >
            <ResponsiveContainer height={320} width="100%">
              <BarChart data={stats.topCarTypes} layout="vertical">
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="carTypeName"
                  tick={{ fontSize: 12 }}
                  type="category"
                  width={120}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#c2410c" radius={[0, 12, 12, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TrendSection>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <TrendSection
            description="Track customer registration momentum during the selected period."
            emptyMessage="No new customer registrations in this reporting period."
            hasData={stats.userRegistrationsByMonth.length > 0}
            title="Customer growth"
          >
            <ResponsiveContainer height={320} width="100%">
              <LineChart data={stats.userRegistrationsByMonth}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  dataKey="count"
                  dot={{ r: 4 }}
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          </TrendSection>
        </div>

        <div className="xl:col-span-2">
          <DistributionSection
            description="Review transaction outcomes to spot payment backlog or failure risk."
            emptyMessage="No payment status data in this reporting period."
            hasData={stats.paymentsByStatus.length > 0}
            title="Payment health"
          >
            <ResponsiveContainer height={320} width="100%">
              <PieChart>
                <Pie
                  data={stats.paymentsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={104}
                  labelLine={false}
                >
                  {stats.paymentsByStatus.map((entry) => (
                    <Cell
                      key={entry.status}
                      fill={PAYMENT_STATUS_COLORS[entry.status] || '#64748b'}
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

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-2">
        <RecentBookingsPanel bookings={stats.recentBookings} />
        <RecentPaymentsPanel payments={stats.recentPayments} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 shadow-sm">
        Last reporting refresh:{' '}
        {format(new Date(stats.reportingPeriod.endDate), 'MMM dd, yyyy h:mm a')}
        {' '}• Currency tooltips use detailed values ({formatChartCurrency(128000)})
      </div>
    </div>
  );
}
