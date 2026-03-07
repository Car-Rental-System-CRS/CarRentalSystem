export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface MonthlyCount {
  month: string;
  count: number;
}

export interface CarTypeCount {
  carTypeName: string;
  count: number;
}

export interface RecentBooking {
  id: string;
  customerName: string;
  carTypeName: string;
  expectedReceiveDate: string | null;
  expectedReturnDate: string | null;
  totalPrice: number;
  status: string;
}

export interface RecentPayment {
  id: string;
  bookingId: string;
  amount: number;
  purpose: string;
  status: string;
  createdAt: string | null;
}

export interface DashboardStats {
  revenueByMonth: MonthlyRevenue[];
  bookingsByStatus: StatusCount[];
  bookingsByMonth: MonthlyCount[];
  topCarTypes: CarTypeCount[];
  paymentsByStatus: StatusCount[];
  userRegistrationsByMonth: MonthlyCount[];
  recentBookings: RecentBooking[];
  recentPayments: RecentPayment[];
}
