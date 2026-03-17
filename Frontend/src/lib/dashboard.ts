import { format } from 'date-fns';

import {
  AttentionState,
  ComparisonDirection,
  DashboardSummaryCard,
} from '@/types/dashboard';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatChartCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Pending';
  }

  try {
    return format(new Date(value), 'MMM dd, yyyy h:mm a');
  } catch {
    return value;
  }
}

export function formatShortDate(value: string | null): string {
  if (!value) {
    return 'Pending';
  }

  try {
    return format(new Date(value), 'MMM dd, yyyy');
  } catch {
    return value;
  }
}

export function getBookingStatusClasses(status: string): string {
  const styles: Record<string, string> = {
    COMPLETED: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    CONFIRMED: 'bg-sky-100 text-sky-700 ring-sky-600/20',
    IN_PROGRESS: 'bg-amber-100 text-amber-800 ring-amber-600/20',
    CREATED: 'bg-indigo-100 text-indigo-700 ring-indigo-600/20',
    CANCELED: 'bg-rose-100 text-rose-700 ring-rose-600/20',
  };

  return styles[status] || 'bg-slate-100 text-slate-700 ring-slate-600/20';
}

export function getPaymentStatusClasses(status: string): string {
  const styles: Record<string, string> = {
    PAID: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    PENDING: 'bg-amber-100 text-amber-800 ring-amber-600/20',
    CANCELLED: 'bg-rose-100 text-rose-700 ring-rose-600/20',
    EXPIRED: 'bg-slate-100 text-slate-700 ring-slate-600/20',
  };

  return styles[status] || 'bg-slate-100 text-slate-700 ring-slate-600/20';
}

export function getAttentionClasses(state: AttentionState): string {
  const styles: Record<AttentionState, string> = {
    NORMAL: 'border-slate-200 bg-white',
    WATCH: 'border-amber-200 bg-amber-50/70',
    CRITICAL: 'border-rose-200 bg-rose-50/80',
  };

  return styles[state];
}

export function getAttentionBadgeClasses(state: AttentionState): string {
  const styles: Record<AttentionState, string> = {
    NORMAL: 'bg-slate-100 text-slate-600',
    WATCH: 'bg-amber-100 text-amber-800',
    CRITICAL: 'bg-rose-100 text-rose-700',
  };

  return styles[state];
}

export function getComparisonClasses(direction: ComparisonDirection): string {
  const styles: Record<ComparisonDirection, string> = {
    UP: 'text-emerald-600',
    DOWN: 'text-rose-600',
    FLAT: 'text-slate-600',
    UNAVAILABLE: 'text-slate-500',
  };

  return styles[direction];
}

export function getComparisonSymbol(direction: ComparisonDirection): string {
  const symbols: Record<ComparisonDirection, string> = {
    UP: '+',
    DOWN: '',
    FLAT: '',
    UNAVAILABLE: '',
  };

  return symbols[direction];
}

export function getPaymentPurposeLabel(purpose: string): string {
  const labels: Record<string, string> = {
    BOOKING_PAYMENT: 'Booking payment',
    FINAL_PAYMENT: 'Final payment',
    OVERDUE_PAYMENT: 'Overdue payment',
  };

  return labels[purpose] || purpose.replace(/_/g, ' ');
}

export function getSummaryIconName(card: DashboardSummaryCard): string {
  const iconMap: Record<string, string> = {
    revenue: 'DollarSign',
    bookings: 'CalendarRange',
    paidPayments: 'Wallet',
    customers: 'Users',
    activeCampaigns: 'Users',
    issuedCoupons: 'Wallet',
    redeemedCoupons: 'BarChart3',
    discountAttributedBookings: 'CalendarRange',
    discountValueGranted: 'DollarSign',
  };

  return iconMap[card.key] || 'BarChart3';
}
