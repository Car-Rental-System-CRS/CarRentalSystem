// src/types/feature.ts

export interface CarFeature {
  id: string; // UUID
  name: string;
  description?: string;
}

/**
 * Page response mapping từ BE
 */
export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}
