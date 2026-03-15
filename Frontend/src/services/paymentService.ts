import axiosInstance from '@/lib/axios';

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

/**
 * Get payment transaction by ID
 * GET /api/payments/{paymentId}
 */
export const getPaymentById = async (paymentId: string): Promise<PaymentTransactionResponse> => {
  const response = await axiosInstance.get<PaymentTransactionResponse>(`/api/payments/${paymentId}`);
  return response.data;
};

/**
 * Get latest payment for a booking
 * GET /api/payments/booking/{bookingId}/latest
 */
export const getLatestPaymentByBookingId = async (
  bookingId: string
): Promise<PaymentTransactionResponse> => {
  const response = await axiosInstance.get<PaymentTransactionResponse>(
    `/api/payments/booking/${bookingId}/latest`
  );
  return response.data;
};

/**
 * Get all payments for a booking
 * GET /api/payments/booking/{bookingId}
 */
export const getAllPaymentsByBookingId = async (
  bookingId: string
): Promise<PaymentTransactionResponse[]> => {
  const response = await axiosInstance.get<PaymentTransactionResponse[]>(
    `/api/payments/booking/${bookingId}`
  );
  return response.data;
};
