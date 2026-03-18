import axios from '@/lib/axios';
import { DashboardStats } from '@/types/dashboard';

interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface DashboardStatsParams {
  startDate?: string;
  endDate?: string;
}

function normalizeDashboardStats(stats: DashboardStats): DashboardStats {
  const revenueByDate = stats.revenueByDate
    ?? stats.revenueByMonth?.map((entry) => ({
      date: `${entry.month}-01`,
      revenue: entry.revenue,
    }))
    ?? [];

  const userRegistrationsByDate = stats.userRegistrationsByDate
    ?? stats.userRegistrationsByMonth?.map((entry) => ({
      date: `${entry.month}-01`,
      count: entry.count,
    }))
    ?? [];

  return {
    ...stats,
    revenueByDate,
    userRegistrationsByDate,
    revenueByMonth: stats.revenueByMonth ?? [],
    userRegistrationsByMonth: stats.userRegistrationsByMonth ?? [],
    bookingsByStatus: stats.bookingsByStatus ?? [],
    bookingsByMonth: stats.bookingsByMonth ?? [],
    topCarTypes: stats.topCarTypes ?? [],
    paymentsByStatus: stats.paymentsByStatus ?? [],
    recentBookings: stats.recentBookings ?? [],
    recentPayments: stats.recentPayments ?? [],
  };
}

export const dashboardService = {
  getStats: async (params?: DashboardStatsParams): Promise<DashboardStats> => {
    // The shared dashboard payload now includes the discount campaign metrics tab data.
    const response = await axios.get<APIResponse<DashboardStats>>(
      '/api/admin/dashboard',
      {
        params: {
          startDate: params?.startDate || undefined,
          endDate: params?.endDate || undefined,
        },
      }
    );
    return normalizeDashboardStats(response.data.data);
  },
};
