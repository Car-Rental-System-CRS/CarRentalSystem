import api from '@/lib/axios';
import { APIResponse } from '@/types/api';

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface AdminBookingResponse {
  id: string;
  cars: {
    id: string;
    name: string;
    brand: string;
    model: string;
    year: number;
    pricePerDay: number;
    quantity: number;
    imageUrl?: string;
  }[];
  totalPrice: number;
  bookingPrice: number;
  depositAmount: number;
  remainingAmount: number;
  overdueCharge: number | null;
  expectedReceiveDate: string;
  expectedReturnDate: string;
  actualReceiveDate: string | null;
  actualReturnDate: string | null;
  status: 'CREATED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  createdAt: string;
  payments: {
    id: string;
    bookingId: string;
    amount: number;
    status: string;
    purpose: string;
    paymentUrl: string | null;
    createdAt: string;
  }[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface StaffBookingParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
  sort?: string;
}

export const staffBookingService = {
  getAll: (params?: StaffBookingParams) =>
    api.get<APIResponse<PageResponse<AdminBookingResponse>>>(
      '/api/staff/bookings',
      { params }
    ),

  getById: (bookingId: string) =>
    api.get<APIResponse<AdminBookingResponse>>(
      `/api/staff/bookings/${bookingId}`
    ),

  confirmPickup: (bookingId: string) =>
    api.put<APIResponse<AdminBookingResponse>>(
      `/api/staff/bookings/${bookingId}/confirm-pickup`
    ),

  confirmReturn: (bookingId: string) =>
    api.put<APIResponse<AdminBookingResponse>>(
      `/api/staff/bookings/${bookingId}/confirm-return`
    ),
};
