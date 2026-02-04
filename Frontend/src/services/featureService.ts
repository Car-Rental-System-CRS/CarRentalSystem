// src/services/featureService.ts

import api from '@/lib/axios';
import { APIResponse } from '@/types/api';
import { CarFeature, PageResponse } from '@/types/feature';

export const featureService = {
  /**
   * GET /api/car-features
   * pagination + filter
   */
  getAll: (params?: {
    name?: string;
    description?: string;
    page?: number; // 0-based (Spring Pageable)
    size?: number;
  }) =>
    api.get<APIResponse<PageResponse<CarFeature>>>('/api/car-features', {
      params,
    }),

  /**
   * GET /api/car-features/{id}
   */
  getById: (id: string) =>
    api.get<APIResponse<CarFeature>>(`/api/car-features/${id}`),

  /**
   * POST /api/car-features
   */
  create: (payload: { name: string; description?: string }) =>
    api.post<APIResponse<CarFeature>>('/api/car-features', payload),

  /**
   * PUT /api/car-features/{id}
   */
  update: (id: string, payload: { name: string; description?: string }) =>
    api.put<APIResponse<CarFeature>>(`/api/car-features/${id}`, payload),

  /**
   * DELETE /api/car-features/{id}
   */
  delete: (id: string) =>
    api.delete<APIResponse<void>>(`/api/car-features/${id}`),
};
