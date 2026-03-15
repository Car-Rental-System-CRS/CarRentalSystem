'use client';

import { AdminBookingResponse } from '@/services/staffBookingService';
import { Car } from 'lucide-react';
import { getServerUrl } from '@/lib/utils';

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
  const resolveImageUrl = (fileUrl?: string) => {
    if (!fileUrl) return '';
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    return `${getServerUrl()}${fileUrl}`;
  };

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
            className="bg-gray-50 rounded-lg p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {car.brand} {car.model}
                </span>
                <span className="text-xs text-gray-500 ml-2">({car.year})</span>
                {car.licensePlate && (
                  <div className="text-xs text-gray-500 mt-1">Plate: {car.licensePlate}</div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-600">
                {formatCurrency(car.pricePerDay)}/day
              </span>
            </div>

            {(booking.status === 'COMPLETED' || booking.postTripInspectionCompleted) && !!car.damageImages?.length && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-700">
                  Recorded Damage Images ({car.damageImages.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {car.damageImages.map((image) => (
                    <a
                      key={image.id}
                      href={resolveImageUrl(image.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={resolveImageUrl(image.fileUrl)}
                        alt={image.description || image.fileName || 'Damage image'}
                        className="w-20 h-16 object-cover rounded border border-gray-200"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
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
