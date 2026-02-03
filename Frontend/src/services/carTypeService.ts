// src/services/carTypeService.ts
import axios from '@/lib/axios';
import {
  GetAllCarTypeParams,
  CarType,
  CreateCarTypePayload,
} from '@/types/carType';
import { APIResponse } from '@/types/api';

export const carTypeService = {
  getAll(params: GetAllCarTypeParams) {
    return axios.get<
      APIResponse<{
        items: CarType[];
        totalItems: number;
        totalPages: number;
        page: number;
        size: number;
      }>
    >('/api/car-types', {
      params: {
        ...params,
        page: params.page ?? 0,
        size: params.size ?? 10,
      },
    });
  },

  getById(id: string | number) {
    return axios.get<APIResponse<CarType>>(`/api/car-types/${id}`);
  },

  create(payload: CreateCarTypePayload) {
    return axios.post<APIResponse<CarType>>('/api/car-types', payload);
  },

  update(id: string | number, payload: CreateCarTypePayload) {
    return axios.put<APIResponse<CarType>>(`/api/car-types/${id}`, payload);
  },

  delete(id: string | number) {
    return axios.delete<APIResponse<void>>(`/api/car-types/${id}`);
  },
};
