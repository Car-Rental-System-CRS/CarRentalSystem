export interface BookingPayload {
  carIds: string[];
  expectedReceiveDate: string;
  expectedReturnDate: string;
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
