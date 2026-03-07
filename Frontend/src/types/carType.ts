// src/types/carType.ts

import { CarBrand } from './brand';

export interface MediaFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  displayOrder?: number;
  createdAt?: string;
  modifiedAt?: string;
}

export interface CarType {
  id: string;
  name: string;
  numberOfSeats: number;
  consumptionKwhPerKm: number;
  price: number;
  carBrand: CarBrand;
  description?: string;
  carQuantity?: number;
  mediaFiles?: MediaFile[];
}

export interface CreateCarTypePayload {
  name: string;
  numberOfSeats: number;
  consumptionKwhPerKm: number;
  price: number;
  brandId: string;
}

export interface ImageWithDescription {
  file: File;
  originalFile: File;
  description: string;
  preview?: string;
  isProcessing?: boolean;
  originalSize?: number;
  compressedSize?: number;
  dimensions?: { width: number; height: number };
}

export type GetAllCarTypeParams = {
  name?: string;
  brandId?: string;
  numberOfSeats?: number;
  minPrice?: number;
  maxPrice?: number;

  page?: number;
  size?: number;
  sort?: string;
};
