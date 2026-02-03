// src/types/car.ts

export interface Car {
  id: string;
  licensePlate: string;
  importDate: string; // ISO date string
  carTypeId: string;
  carTypeName: string;
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

  page?: number;
  size?: number;
  sort?: string;
};
