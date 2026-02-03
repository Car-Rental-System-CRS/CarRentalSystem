// src/types/carType.ts

import { CarBrand } from './brand';

export interface CarType {
  id: string;
  name: string;
  numberOfSeats: number;
  consumptionKwhPerKm: number;
  price: number;
  carBrand: CarBrand;
}

export interface CreateCarTypePayload {
  name: string;
  numberOfSeats: number;
  consumptionKwhPerKm: number;
  price: number;
  brandId: string;
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
