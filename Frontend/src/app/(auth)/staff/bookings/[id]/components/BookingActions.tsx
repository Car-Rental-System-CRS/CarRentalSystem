'use client';

import { useState } from 'react';
import { AdminBookingResponse, staffBookingService } from '@/services/staffBookingService';
import { Button } from '@/components/ui/Button';
import { handleError, handleSuccess } from '@/lib/errorHandler';
import { CheckCircle, RotateCcw, Loader2 } from 'lucide-react';

interface Props {
  booking: AdminBookingResponse;
  onUpdated: (booking: AdminBookingResponse) => void;
}

export default function BookingActions({ booking, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirmPickup = async () => {
    if (!confirm('Are you sure the car has been handed to the renter?')) return;
    setLoading(true);
    try {
      const res = await staffBookingService.confirmPickup(booking.id);
      onUpdated(res.data.data);
      handleSuccess('Car pickup confirmed', 'Booking is now IN PROGRESS');
    } catch (error) {
      handleError(error, 'Failed to confirm pickup');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!confirm('Are you sure the car has been returned by the renter?')) return;
    setLoading(true);
    try {
      const res = await staffBookingService.confirmReturn(booking.id);
      onUpdated(res.data.data);
      if (res.data.data.overdueCharge && res.data.data.overdueCharge > 0) {
        handleSuccess(
          'Car return confirmed',
          'Overdue charges have been calculated. Awaiting payment.'
        );
      } else {
        handleSuccess('Car return confirmed', 'Booking is now COMPLETED');
      }
    } catch (error) {
      handleError(error, 'Failed to confirm return');
    } finally {
      setLoading(false);
    }
  };

  if (booking.status === 'COMPLETED') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
        <h3 className="text-lg font-semibold text-green-800">Booking Complete</h3>
        <p className="text-sm text-green-600 mt-1">
          All payments resolved. No further actions available.
        </p>
      </div>
    );
  }

  if (booking.status === 'CANCELED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800">Booking Canceled</h3>
        <p className="text-sm text-red-600 mt-1">
          This booking has been canceled.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Actions</h3>

      {booking.status === 'CREATED' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Waiting for renter to pay the deposit. No actions available yet.
          </p>
        </div>
      )}

      {booking.status === 'CONFIRMED' && (
        <Button
          onClick={handleConfirmPickup}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4 mr-2" />
          )}
          Confirm Pickup
        </Button>
      )}

      {booking.status === 'IN_PROGRESS' && (
        <Button
          onClick={handleConfirmReturn}
          disabled={loading}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
          size="lg"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RotateCcw className="w-4 h-4 mr-2" />
          )}
          Confirm Return
        </Button>
      )}
    </div>
  );
}
