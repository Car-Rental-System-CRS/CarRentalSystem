'use client';

import { AdminBookingResponse } from '@/services/staffBookingService';
import { Car } from 'lucide-react';

interface Props {
  booking: AdminBookingResponse;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function BookingCarsCard({ booking }: Props) {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Car className="w-5 h-5 text-blue-600" />
        Cars ({booking.cars.length})
      </h3>

      <div className="space-y-2">
        {booking.cars.map((car) => (
          <div
            key={car.id}
            className="bg-gray-50 rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <span className="text-sm font-medium text-gray-900">
                {car.brand} {car.model}
              </span>
              <span className="text-xs text-gray-500 ml-2">({car.year})</span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              {formatCurrency(car.pricePerDay)}/day
            </span>
          </div>
        ))}
        {booking.cars.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-4">
            No cars assigned
          </div>
        )}
      </div>
    </div>
  );
}
