import axiosInstance from '@/lib/axios';

export interface CreateBookingRequest {
  carIds: string[]; // UUID[]
  expectedReceiveDate: string; // LocalDate format: YYYY-MM-DD
  expectedReturnDate: string; // LocalDate format: YYYY-MM-DD
}

export interface CarResponse {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  quantity: number;
  imageUrl?: string;
}

export interface PaymentTransactionResponse {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
}

export interface PaymentTransactionResponse {
  id: string;
  bookingId: string;
  amount: number;
  payOSPaymentCode: number;
  paymentUrl: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  purpose: 'BOOKING_PAYMENT' | 'FINAL_PAYMENT';
  createdAt: string;
  lastUpdatedAt: string;
}

export interface BookingResponse {
  id: string;
  cars: CarResponse[];
  totalPrice: number;
  bookingPrice: number;
  expectedReceiveDate: string;
  expectedReturnDate: string;
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
