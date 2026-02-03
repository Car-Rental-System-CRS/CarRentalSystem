// src/types/feature.ts

export interface CarFeature {
  id: string; // UUID
  name: string;
  description?: string;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
