// src/types/car.ts

export interface Car {
  id: string;
  licensePlate: string;
  importDate: string;
  carTypeId: string;
  carTypeName: string;
  damageImages?: CarDamageImage[];
}

export interface CarDamageImage {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description?: string;
  displayOrder?: number;
  damageSource?: 'LEGACY_OR_MANUAL' | 'POST_TRIP_INSPECTION' | null;
  sourceBookingId?: string | null;
  createdAt?: string;
  modifiedAt?: string;
}

/* ---------- CREATE / UPDATE ---------- */
export interface CreateCarPayload {
  licensePlate: string;
  importDate: string; // yyyy-MM-dd
  typeId: string; // UUID
}

/* ---------- FILTER + PAGINATION ---------- */
export type GetAllCarParams = {
  licensePlate?: string;
  importFrom?: string; // yyyy-MM-dd
  importTo?: string; // yyyy-MM-dd
  typeId?: string;
  page?: number;
  size?: number;
  sort?: string;
};
