// src/services/carService.ts

import axios from '@/lib/axios';
import {
  Car,
  CarDamageImage,
  CreateCarPayload,
  GetAllCarParams,
} from '@/types/car';
import { ImageWithDescription } from '@/types/carType';
import { APIResponse } from '@/types/api';

export const carService = {
  /* ---------- GET ALL ---------- */
  getAll(params: GetAllCarParams) {
    return axios.get<
      APIResponse<{
        items: Car[];
        totalItems: number;
        totalPages: number;
        page: number;
        size: number;
      }>
    >('/api/cars', {
      params: {
        ...params,
        page: params.page ?? 0, // Spring Pageable = 0-based
        size: params.size ?? 10,
      },
    });
  },

  /* ---------- GET BY ID ---------- */
  getById(id: string) {
    return axios.get<APIResponse<Car>>(`/api/cars/${id}`);
  },

  /* ---------- CREATE ---------- */
  create(payload: CreateCarPayload) {
    return axios.post<APIResponse<Car>>('/api/cars', payload);
  },

  /* ---------- UPDATE ---------- */
  update(id: string, payload: CreateCarPayload) {
    return axios.put<APIResponse<Car>>(`/api/cars/${id}`, payload);
  },

  uploadDamageImages(carId: string, imagesWithDescriptions: ImageWithDescription[]) {
    const formData = new FormData();

    imagesWithDescriptions.forEach((item) => {
      formData.append('images', item.file);
      formData.append('imageDescriptions', item.description || '');
    });

    return axios.post<APIResponse<CarDamageImage[]>>(
      `/api/cars/${carId}/damage-images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
      }
    );
  },

  deleteDamageImage(carId: string, imageId: string) {
    return axios.delete<APIResponse<void>>(
      `/api/cars/${carId}/damage-images/${imageId}`
    );
  },

  /* ---------- DELETE ---------- */
  delete(id: string) {
    return axios.delete<APIResponse<void>>(`/api/cars/${id}`);
  },
};
