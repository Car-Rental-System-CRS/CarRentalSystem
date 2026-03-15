import axiosInstance from '@/lib/axios';

export interface CreateBookingRequest {
  carTypeId: string;
  quantity: number;
  selectedCarIds?: string[];
  expectedReceiveDate: string; // ISO datetime format
  expectedReturnDate: string; // ISO datetime format
  payNow: boolean;
}

export interface MediaFileResponse {
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

export interface CarResponse {
  id: string;
  licensePlate: string;
  importDate: string;
  typeId: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  quantity: number;
  imageUrl?: string;
  damageImages?: MediaFileResponse[];
}

export interface PaymentTransactionResponse {
  id: string;
  bookingId: string;
  amount: number;
  payOSPaymentCode: number;
  paymentUrl: string | null;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  purpose: 'BOOKING_PAYMENT' | 'FINAL_PAYMENT' | 'OVERDUE_PAYMENT';
  paymentMethod: 'PAYOS' | 'CASH';
  createdAt: string;
  lastUpdatedAt: string;
}

export interface BookingResponse {
  id: string;
  cars: CarResponse[];
  totalPrice: number;
  bookingPrice: number;
  depositAmount: number;
  remainingAmount: number;
  overdueCharge: number | null;
  expectedReceiveDate: string;
  expectedReturnDate: string;
  actualReceiveDate: string | null;
  actualReturnDate: string | null;
  status: string;
  createdAt: string;
  payments: PaymentTransactionResponse[];
}

/**
 * Create a new booking
 * POST /api/bookings
 */
export const createBooking = async (
  request: CreateBookingRequest
): Promise<BookingResponse> => {
  const response = await axiosInstance.post<BookingResponse>('/api/bookings', request);
  return response.data;
};

/**
 * Get booking by ID
 * GET /api/bookings/{bookingId}
 */
export const getBookingById = async (bookingId: string): Promise<BookingResponse> => {
  const response = await axiosInstance.get<BookingResponse>(`/api/bookings/${bookingId}`);
  return response.data;
};

/**
 * Get all bookings of current user
 * GET /api/bookings/my-bookings
 */
export const getMyBookings = async (): Promise<BookingResponse[]> => {
  const response = await axiosInstance.get<BookingResponse[]>('/api/bookings/my-bookings');
  return response.data;
};
