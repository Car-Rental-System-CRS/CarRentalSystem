import api from '@/lib/axios';
import { APIResponse } from '@/types/api';
import {
  CouponSummary,
  CreateDiscountCampaignRequest,
  DiscountCampaign,
  GenerateCouponsRequest,
} from '@/types/discountCampaign';

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export const discountCampaignService = {
  getAll: async (params?: { page?: number; size?: number }) => {
    const response = await api.get<APIResponse<PageResponse<DiscountCampaign>>>('/api/admin/discount-campaigns', {
      params,
    });
    return response.data.data;
  },

  getById: async (campaignId: string) => {
    const response = await api.get<APIResponse<DiscountCampaign>>(`/api/admin/discount-campaigns/${campaignId}`);
    return response.data.data;
  },

  create: async (payload: CreateDiscountCampaignRequest) => {
    const response = await api.post<APIResponse<DiscountCampaign>>('/api/admin/discount-campaigns', payload);
    return response.data.data;
  },

  update: async (campaignId: string, payload: CreateDiscountCampaignRequest) => {
    const response = await api.put<APIResponse<DiscountCampaign>>(`/api/admin/discount-campaigns/${campaignId}`, payload);
    return response.data.data;
  },

  activate: async (campaignId: string) => {
    const response = await api.post<APIResponse<DiscountCampaign>>(`/api/admin/discount-campaigns/${campaignId}/activate`);
    return response.data.data;
  },

  pause: async (campaignId: string) => {
    const response = await api.post<APIResponse<DiscountCampaign>>(`/api/admin/discount-campaigns/${campaignId}/pause`);
    return response.data.data;
  },

  end: async (campaignId: string) => {
    const response = await api.post<APIResponse<DiscountCampaign>>(`/api/admin/discount-campaigns/${campaignId}/end`);
    return response.data.data;
  },

  generateCoupons: async (campaignId: string, payload: GenerateCouponsRequest) => {
    const response = await api.post<APIResponse<CouponSummary[]>>(`/api/admin/discount-campaigns/${campaignId}/coupons/generate`, payload);
    return response.data.data;
  },
};
