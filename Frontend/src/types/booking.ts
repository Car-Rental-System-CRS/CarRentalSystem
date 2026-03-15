import { CarDamageImage } from './car';

export interface BookingPayload {
  carTypeId: string;
  quantity: number;
  selectedCarIds?: string[];
  expectedReceiveDate: string;
  expectedReturnDate: string;
  payNow: boolean;
}

export interface SelectedCarUnit {
  id: string;
  licensePlate: string;
  importDate: string;
  name?: string;
  brand?: string;
  model?: string;
  year?: number;
  imageUrl?: string;
  damageImages?: CarDamageImage[];
}

export interface CartItem {
  id: string;              // Unique cart item ID (carTypeId + pickup + return)
  carTypeId: string;
  carTypeName: string;
  pricePerHour: number;
  pricePerDay: number;
  quantity: number;
  pickupDateTime: Date;
  returnDateTime: Date;
  totalHours: number;
  totalDays: number;
  remainingHours: number;
  totalPrice: number;
  selectedCarIds: string[];
  selectedCars: SelectedCarUnit[];
  image?: string;
}

export interface BookingItem {
  vehicleId: string;
  vehicleName: string;
  pricePerDay: number;
  quantity: number;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalPrice: number;
  image?: string;
}

export interface BookingStatus {
  PENDING: 'PENDING';
  CONFIRMED: 'CONFIRMED';
  CANCELLED: 'CANCELLED';
  COMPLETED: 'COMPLETED';
}
