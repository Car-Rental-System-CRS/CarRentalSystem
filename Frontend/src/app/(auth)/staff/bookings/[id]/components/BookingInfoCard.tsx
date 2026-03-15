'use client';

import { BookingStatusBadge } from '@/components/BookingStatusBadge';
import { AdminBookingResponse } from '@/services/staffBookingService';
import { User, Mail, Phone, Calendar, Clock } from 'lucide-react';

interface Props {
  booking: AdminBookingResponse;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BookingInfoCard({ booking }: Props) {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Booking Information</h3>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="text-sm text-gray-500">
        ID: <span className="font-mono">{booking.id}</span>
      </div>

      {/* Customer Info */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Customer</h4>
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

      {/* Dates */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Rental Period</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Calendar className="w-3 h-3" />
              Expected Pickup
            </div>
            <span className="font-medium text-sm">
              {formatDate(booking.expectedReceiveDate)}
            </span>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Calendar className="w-3 h-3" />
              Expected Return
            </div>
            <span className="font-medium text-sm">
              {formatDate(booking.expectedReturnDate)}
            </span>
          </div>
        </div>

        {/* Actual dates */}
        {(booking.actualReceiveDate || booking.actualReturnDate) && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            {booking.actualReceiveDate && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-green-600 mb-1">
                  <Clock className="w-3 h-3" />
                  Actual Pickup
                </div>
                <span className="font-medium text-sm text-green-700">
                  {formatDateTime(booking.actualReceiveDate)}
                </span>
              </div>
            )}
            {booking.actualReturnDate && (
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-green-600 mb-1">
                  <Clock className="w-3 h-3" />
                  Actual Return
                </div>
                <span className="font-medium text-sm text-green-700">
                  {formatDateTime(booking.actualReturnDate)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400">
        Created: {formatDateTime(booking.createdAt)}
      </div>

      {(booking.pickupNotes || booking.returnNotes) && (
        <div className="pt-2 border-t border-gray-100 space-y-2">
          {booking.pickupNotes && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase">Pickup Notes</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{booking.pickupNotes}</p>
            </div>
          )}
          {booking.returnNotes && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase">Return Notes</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{booking.returnNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
