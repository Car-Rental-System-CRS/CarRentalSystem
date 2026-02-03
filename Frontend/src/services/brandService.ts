import api from '@/lib/axios';
import { APIResponse } from '@/types/api';
import { CarBrand, PageResponse } from '@/types/brand';

export const carBrandService = {
  getAll: (params?: { name?: string; page?: number; size?: number }) =>
    api.get<APIResponse<PageResponse<CarBrand>>>('/api/car-brands', {
      params,
    }),

  getById: (id: string) =>
    api.get<APIResponse<CarBrand>>(`/api/car-brands/${id}`),

  create: (payload: { name: string }) =>
    api.post<APIResponse<CarBrand>>('/api/car-brands', payload),

  update: (id: string, payload: { name: string }) =>
    api.put<APIResponse<CarBrand>>(`/api/car-brands/${id}`, payload),

  delete: (id: string) =>
    api.delete<APIResponse<void>>(`/api/car-brands/${id}`),
};
