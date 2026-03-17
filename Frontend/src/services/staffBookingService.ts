import api from '@/lib/axios';
import { APIResponse } from '@/types/api';
import { ImageWithDescription } from '@/types/carType';

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface StaffMediaFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  description: string | null;
  displayOrder: number;
  damageSource?: 'LEGACY_OR_MANUAL' | 'POST_TRIP_INSPECTION' | null;
  sourceBookingId?: string | null;
  createdAt: string;
  modifiedAt: string;
}

export interface BookingNotificationResponse {
  id: string;
  eventType:
    | 'BOOKING_CONFIRMED'
    | 'VEHICLE_PICKED_UP'
    | 'VEHICLE_RETURNED'
    | 'OVERDUE_WARNING'
    | 'BOOKING_COMPLETED';
  recipientEmail: string | null;
  deliveryStatus: 'PENDING' | 'SENT' | 'FAILED' | 'SKIPPED';
  attemptCount: number;
  triggeredAt: string;
  lastAttemptAt: string | null;
  sentAt: string | null;
  failureReason: string | null;
}

export interface AdminBookingResponse {
  id: string;
  cars: {
    id: string;
    licensePlate?: string;
    name: string;
    brand: string;
    model: string;
    year: number;
    pricePerDay: number;
    quantity: number;
    imageUrl?: string;
    damageImages?: StaffMediaFile[];
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
  pickupNotes: string | null;
  returnNotes: string | null;
  postTripInspectionAt: string | null;
  postTripInspectionCompleted: boolean | null;
  status: 'CREATED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  createdAt: string;
  payments: {
    id: string;
    bookingId: string;
    amount: number;
    status: string;
    purpose: string;
    paymentMethod: 'PAYOS' | 'CASH';
    paymentUrl: string | null;
    createdAt: string;
  }[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notifications: BookingNotificationResponse[];
}

export interface PostTripInspectionItemRequest {
  carId: string;
  notes?: string;
  hasNewDamage: boolean;
  uploadedDamageImageCount?: number;
  damageImageIds?: string[];
}

export interface PostTripInspectionRequest {
  noAdditionalDamage: boolean;
  summaryNotes?: string;
  items?: PostTripInspectionItemRequest[];
}

export interface PostTripInspectionItemResponse {
  carId: string;
  licensePlate: string;
  hasNewDamage: boolean;
  uploadedDamageImageCount: number;
  notes: string | null;
  damageImages: StaffMediaFile[];
}

export interface PostTripInspectionResponse {
  id?: string;
  bookingId: string;
  completed: boolean;
  noAdditionalDamage: boolean;
  summaryNotes: string | null;
  inspectedAt: string | null;
  inspectedByAccountId: string | null;
  items: PostTripInspectionItemResponse[];
}

export interface StaffPaymentTransactionResponse {
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

  confirmPickup: (bookingId: string, payload?: { pickupNotes?: string }) =>
    api.put<APIResponse<AdminBookingResponse>>(
      `/api/staff/bookings/${bookingId}/confirm-pickup`,
      payload ?? {}
    ),

  confirmReturn: (bookingId: string, payload?: { returnNotes?: string }) =>
    api.put<APIResponse<AdminBookingResponse>>(
      `/api/staff/bookings/${bookingId}/confirm-return`,
      payload ?? {}
    ),

  createFinalPayment: (bookingId: string) =>
    api.post<APIResponse<StaffPaymentTransactionResponse>>(
      `/api/staff/bookings/${bookingId}/final-payment`
    ),

  settleCash: (bookingId: string) =>
    api.post<APIResponse<StaffPaymentTransactionResponse>>(
      `/api/staff/bookings/${bookingId}/settle-cash`
    ),

  getPostTripInspection: (bookingId: string) =>
    api.get<APIResponse<PostTripInspectionResponse>>(
      `/api/staff/bookings/${bookingId}/post-trip-inspection`
    ),

  upsertPostTripInspection: (bookingId: string, payload: PostTripInspectionRequest) =>
    api.put<APIResponse<PostTripInspectionResponse>>(
      `/api/staff/bookings/${bookingId}/post-trip-inspection`,
      payload
    ),

  uploadPostTripDamageImages: (
    bookingId: string,
    carId: string,
    imagesWithDescriptions: ImageWithDescription[]
  ) => {
    const formData = new FormData();

    imagesWithDescriptions.forEach((item) => {
      formData.append('images', item.file);
      formData.append('imageDescriptions', item.description || '');
    });

    return api.post<APIResponse<StaffMediaFile[]>>(
      `/api/staff/bookings/${bookingId}/cars/${carId}/post-trip-damage-images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
      }
    );
  },
};
