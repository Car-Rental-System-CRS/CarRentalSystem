import { BookingResponse } from '@/services/bookingService';
import { BookingStatusBadge } from '@/components/BookingStatusBadge';
import { Calendar, DollarSign, Car, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface BookingCardProps {
  booking: BookingResponse;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPaymentStatus = (): string => {
    if (!booking.payments || booking.payments.length === 0) {
      return 'No payments';
    }
    
    const latestPayment = booking.payments.at(-1);
    if (!latestPayment) {
      return 'Unknown';
    }
    return latestPayment.status;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header: Booking ID and Status */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Booking ID</h3>
            <p className="text-lg font-semibold text-gray-900">
              #{booking.id.substring(0, 8)}
            </p>
          </div>
          <BookingStatusBadge status={booking.status} />
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Dates */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Rental Period</p>
              <p className="text-sm text-gray-600">
                {formatDate(booking.expectedReceiveDate)} -{' '}
                {formatDate(booking.expectedReturnDate)}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Total Amount</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(booking.totalPrice)}
              </p>
              <p className="text-xs text-gray-500">
                Deposit: {formatCurrency(booking.bookingPrice)}
              </p>
            </div>
          </div>
        </div>

        {/* Cars */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-5 h-5 text-gray-600" />
            <h4 className="text-sm font-semibold text-gray-700">
              Vehicles ({booking.cars.length})
            </h4>
          </div>
          <div className="space-y-2">
            {booking.cars.map((car) => (
              <div
                key={car.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {car.imageUrl && (
                    <img
                      src={car.imageUrl}
                      alt={car.name}
                      className="w-16 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{car.name}</p>
                    <p className="text-sm text-gray-600">
                      {car.brand} {car.model} • {car.year}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(car.pricePerDay)}/day
                  </p>
                  <p className="text-xs text-gray-500">Qty: {car.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        {booking.payments && booking.payments.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">Payment Status</p>
              <p className="text-sm text-gray-600">{getPaymentStatus()}</p>
            </div>
          </div>
        )}

        {/* Footer: Created Date and Action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500">Created on</p>
            <p className="text-sm font-medium text-gray-700">
              {formatDate(booking.createdAt)}
            </p>
          </div>
          <Link
            href={`/bookings/${booking.id}`}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
