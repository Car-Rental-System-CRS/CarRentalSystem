import { CartItem } from './booking';

export interface VehicleUnit {
  carId: string;
  license: string;
  importDate: string;
}

export interface VehicleModel {
  id: string;
  carName: string;
  brandId: string;
  brandName: string;
  numberOfSeats: number;
  consumption: string;
  pricePerDay: number;
  featureIds: string[];
  features: Array<{ id: string; name: string; description?: string }>;
  units: VehicleUnit[];
  quantity: number;
  image?: string;
  images?: string[];
  description?: string;
}

export interface BookingItem {
  vehicleId: string;
  vehicleName: string;
  pricePerDay: number;
  quantity: number;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalHours?: number;
  totalPrice: number;
  image?: string;
}

export interface BookingContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => boolean;
  removeFromCart: (cartItemId: string) => void;
  getCartItem: (carTypeId: string, pickupDateTime: Date, returnDateTime: Date) => CartItem | undefined;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}
