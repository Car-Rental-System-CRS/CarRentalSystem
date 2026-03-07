'use client';

import { AdminBookingResponse } from '@/services/staffBookingService';
import { Separator } from '@/components/ui/separator';
import { DollarSign } from 'lucide-react';

interface Props {
  booking: AdminBookingResponse;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function BookingPriceCard({ booking }: Props) {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-600" />
        Price Breakdown
      </h3>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Booking Price</span>
          <span className="font-medium">{formatCurrency(booking.bookingPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Deposit Amount (30%)</span>
          <span className="font-medium">{formatCurrency(booking.depositAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Remaining Amount</span>
          <span className="font-medium">{formatCurrency(booking.remainingAmount)}</span>
        </div>

        {booking.overdueCharge != null && booking.overdueCharge > 0 && (
          <>
            <Separator />
            <div className="flex justify-between text-orange-600">
              <span className="font-medium">Overdue Charge (1.5x)</span>
              <span className="font-semibold">
                +{formatCurrency(booking.overdueCharge)}
              </span>
            </div>
          </>
        )}

        <Separator />
        <div className="flex justify-between font-semibold text-base">
          <span>Total Price</span>
          <span className="text-blue-600">
            {formatCurrency(booking.totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
