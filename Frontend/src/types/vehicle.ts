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
  totalPrice: number;
  image?: string;
}

export interface BookingContextType {
  bookingItems: BookingItem[];
  addToBooking: (vehicle: VehicleModel, startDate: Date, endDate: Date, quantity: number) => void;
  removeFromBooking: (vehicleId: string) => void;
  updateBookingQuantity: (vehicleId: string, quantity: number) => void;
  clearBooking: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}
