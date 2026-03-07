// src/services/carTypeService.ts
import axios from '@/lib/axios';
import {
  GetAllCarTypeParams,
  CarType,
  CreateCarTypePayload,
  ImageWithDescription,
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

  create(payload: CreateCarTypePayload, imagesWithDescriptions?: ImageWithDescription[]) {
    const formData = new FormData();
    
    // Append all fields
    formData.append('name', payload.name);
    formData.append('brandId', payload.brandId);
    formData.append('numberOfSeats', payload.numberOfSeats.toString());
    formData.append('consumptionKwhPerKm', payload.consumptionKwhPerKm.toString());
    formData.append('price', payload.price.toString());
    
    // Append images and descriptions if provided
    if (imagesWithDescriptions && imagesWithDescriptions.length > 0) {
      imagesWithDescriptions.forEach((item) => {
        formData.append('images', item.file);
        formData.append('imageDescriptions', item.description || '');
      });
    }
    
    return axios.post<APIResponse<CarType>>('/api/car-types', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds timeout for large uploads
      maxContentLength: 50 * 1024 * 1024, // 50MB max content length
      maxBodyLength: 50 * 1024 * 1024, // 50MB max body length
    });
  },

  update(id: string | number, payload: CreateCarTypePayload, imagesWithDescriptions?: ImageWithDescription[]) {
    const formData = new FormData();
    
    // Append all fields
    formData.append('name', payload.name);
    formData.append('brandId', payload.brandId);
    formData.append('numberOfSeats', payload.numberOfSeats.toString());
    formData.append('consumptionKwhPerKm', payload.consumptionKwhPerKm.toString());
    formData.append('price', payload.price.toString());
    
    // Append images and descriptions if provided
    if (imagesWithDescriptions && imagesWithDescriptions.length > 0) {
      imagesWithDescriptions.forEach((item) => {
        formData.append('images', item.file);
        formData.append('imageDescriptions', item.description || '');
      });
    }
    
    return axios.put<APIResponse<CarType>>(`/api/car-types/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds timeout for large uploads
      maxContentLength: 50 * 1024 * 1024, // 50MB max content length
      maxBodyLength: 50 * 1024 * 1024, // 50MB max body length
    });
  },

  delete(id: string | number) {
    return axios.delete<APIResponse<void>>(`/api/car-types/${id}`);
  },

  addImages(id: string | number, imagesWithDescriptions: ImageWithDescription[]) {
    const formData = new FormData();
    
    // Append images and descriptions
    imagesWithDescriptions.forEach((item) => {
      formData.append('images', item.file);
      formData.append('imageDescriptions', item.description || '');
    });
    
    return axios.post<APIResponse<CarType>>(`/api/car-types/${id}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds timeout for large uploads
      maxContentLength: 50 * 1024 * 1024, // 50MB max content length
      maxBodyLength: 50 * 1024 * 1024, // 50MB max body length
    });
  },
};
