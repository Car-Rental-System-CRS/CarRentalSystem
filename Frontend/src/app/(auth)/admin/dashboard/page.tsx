'use client';

import { useEffect, useState, useCallback } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { dashboardService } from '@/services/dashboardService';
import { DashboardStats } from '@/types/dashboard';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

const COLORS = [
  '#8b5cf6',
  '#06b6d4',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#6366f1',
  '#ec4899',
  '#14b8a6',
];

const BOOKING_STATUS_COLORS: Record<string, string> = {
  CREATED: '#6366f1',
  CONFIRMED: '#06b6d4',
  IN_PROGRESS: '#f59e0b',
  COMPLETED: '#10b981',
  CANCELED: '#ef4444',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b',
  PAID: '#10b981',
  CANCELLED: '#ef4444',
  EXPIRED: '#6b7280',
};

type PresetRange =
  | '7d'
  | '30d'
  | '3m'
  | '6m'
  | '12m'
  | 'all'
  | 'custom';

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
      return null; // no filter
    case 'custom':
      return null;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}


export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [preset, setPreset] = useState<PresetRange>('12m');
  const [customRange, setCustomRange] = useState<DateRange | undefined>(
    undefined
  );

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (preset === 'custom' && customRange?.from) {
        startDate = customRange.from.toISOString();
        endDate = customRange.to
          ? customRange.to.toISOString()
          : new Date().toISOString();
      } else if (preset !== 'all') {
        const dates = getPresetDates(preset);
        if (dates) {
          startDate = dates.start.toISOString();
          endDate = dates.end.toISOString();
        }
      }

      const data = await dashboardService.getStats({ startDate, endDate });
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [preset, customRange]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-red-500">{error || 'No data available'}</p>
        <Button onClick={fetchDashboard} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Time Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

        <div className="flex items-center gap-3">
          <Select
            value={preset}
            onValueChange={(val) => setPreset(val as PresetRange)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {preset === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !customRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customRange?.from ? (
                    customRange.to ? (
                      <>
                        {format(customRange.from, 'LLL dd, y')} –{' '}
                        {format(customRange.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(customRange.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={customRange?.from}
                  selected={customRange}
                  onSelect={setCustomRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Row 1: Revenue Over Time + Booking Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.revenueByMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No revenue data
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) =>
                      `${(v / 1_000_000).toFixed(1)}M`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      'Revenue',
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Booking Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.bookingsByStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No booking data
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.bookingsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ status, count }) => `${status} (${count})`}
                  >
                    {stats.bookingsByStatus.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={
                          BOOKING_STATUS_COLORS[entry.status] || '#6b7280'
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Bookings Over Time + Top Car Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bookings Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.bookingsByMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No booking data
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.bookingsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Top Car Types by Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topCarTypes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No car type data
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topCarTypes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="carTypeName"
                    tick={{ fontSize: 12 }}
                    width={120}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#f59e0b"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: User Registrations + Payment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              User Registrations Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.userRegistrationsByMonth.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No registration data
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.userRegistrationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Payment Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.paymentsByStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">
                No payment data
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.paymentsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ status, count }) => `${status} (${count})`}
                  >
                    {stats.paymentsByStatus.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={
                          PAYMENT_STATUS_COLORS[entry.status] || '#6b7280'
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Recent Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent bookings
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Car Type</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentBookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">
                        {b.customerName}
                      </TableCell>
                      <TableCell>{b.carTypeName || '—'}</TableCell>
                      <TableCell>{formatCurrency(b.totalPrice)}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                            b.status === 'COMPLETED' &&
                              'bg-green-100 text-green-700',
                            b.status === 'CONFIRMED' &&
                              'bg-cyan-100 text-cyan-700',
                            b.status === 'IN_PROGRESS' &&
                              'bg-yellow-100 text-yellow-700',
                            b.status === 'CREATED' &&
                              'bg-indigo-100 text-indigo-700',
                            b.status === 'CANCELED' &&
                              'bg-red-100 text-red-700'
                          )}
                        >
                          {b.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentPayments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No recent payments
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {formatCurrency(p.amount)}
                      </TableCell>
                      <TableCell>
                        {p.purpose === 'BOOKING_PAYMENT'
                          ? 'Booking'
                          : 'Final'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                            p.status === 'PAID' &&
                              'bg-green-100 text-green-700',
                            p.status === 'PENDING' &&
                              'bg-yellow-100 text-yellow-700',
                            p.status === 'CANCELLED' &&
                              'bg-red-100 text-red-700',
                            p.status === 'EXPIRED' &&
                              'bg-gray-100 text-gray-700'
                          )}
                        >
                          {p.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
