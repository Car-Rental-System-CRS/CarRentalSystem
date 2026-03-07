'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookingStatusBadge } from '@/components/BookingStatusBadge';
import { PaymentStatusBadge } from '@/components/PaymentStatusBadge';
import { AdminBookingResponse } from '@/services/staffBookingService';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, Car, CreditCard, Calendar } from 'lucide-react';

interface Props {
  booking: AdminBookingResponse | null;
  open: boolean;
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BookingDetailDialog({ booking, open, onClose }: Props) {
  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Booking Details
            <BookingStatusBadge status={booking.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Booking ID */}
          <div className="text-sm text-gray-500">
            ID: <span className="font-mono">{booking.id}</span>
          </div>

          {/* Customer Info */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Customer Information
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span>{booking.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{booking.customerEmail}</span>
              </div>
              {booking.customerPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{booking.customerPhone}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Rental Period */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Rental Period
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Calendar className="w-3 h-3" />
                  Pickup Date
                </div>
                <span className="font-medium text-sm">
                  {formatDate(booking.expectedReceiveDate)}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Calendar className="w-3 h-3" />
                  Return Date
                </div>
                <span className="font-medium text-sm">
                  {formatDate(booking.expectedReturnDate)}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cars */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Car className="w-4 h-4" />
              Cars ({booking.cars.length})
            </h4>
            <div className="space-y-2">
              {booking.cars.map((car) => (
                <div
                  key={car.id}
                  className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                >
                  <span className="text-sm font-medium">
                    {car.brand} {car.model} ({car.year})
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(car.pricePerDay)}/day
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Price Breakdown
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Booking Price</span>
                <span>{formatCurrency(booking.bookingPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Deposit Amount</span>
                <span>{formatCurrency(booking.depositAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Remaining Amount</span>
                <span>{formatCurrency(booking.remainingAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Price</span>
                <span className="text-blue-600">
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Payments */}
          {booking.payments && booking.payments.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Transactions ({booking.payments.length})
                </h4>
                <div className="space-y-2">
                  {booking.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-gray-50 rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <span className="text-sm font-medium">
                          {payment.purpose.replace(/_/g, ' ')}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(payment.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {formatCurrency(payment.amount)}
                        </span>
                        <PaymentStatusBadge status={payment.status as 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED'} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
