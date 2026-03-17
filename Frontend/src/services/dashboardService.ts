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
    return response.data.data;
  },
};
