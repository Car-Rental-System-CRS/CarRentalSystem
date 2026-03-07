'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BookingStatusBadge } from '@/components/BookingStatusBadge';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AdminBookingResponse } from '@/services/staffBookingService';
import Link from 'next/link';

interface Props {
  bookings: AdminBookingResponse[];
  loading?: boolean;
  onViewDetail?: (booking: AdminBookingResponse) => void;
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
    month: '2-digit',
    day: '2-digit',
  });
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BookingTable({
  bookings,
  loading,
  onViewDetail,
}: Props) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-semibold">Booking ID</TableHead>
            <TableHead className="font-semibold">Customer</TableHead>
            <TableHead className="font-semibold">Cars</TableHead>
            <TableHead className="font-semibold">Pickup Date</TableHead>
            <TableHead className="font-semibold">Return Date</TableHead>
            <TableHead className="font-semibold">Total Price</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Created At</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id} className="hover:bg-gray-50">
              <TableCell className="font-mono text-xs text-gray-500">
                {booking.id.substring(0, 8)}...
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {booking.customerName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {booking.customerEmail}
                  </span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-1">
                  {booking.cars.length > 0 ? (
                    booking.cars.slice(0, 2).map((car) => (
                      <span key={car.id} className="text-sm text-gray-700">
                        {car.brand} {car.model}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">No cars</span>
                  )}
                  {booking.cars.length > 2 && (
                    <span className="text-xs text-gray-400">
                      +{booking.cars.length - 2} more
                    </span>
                  )}
                </div>
              </TableCell>

              <TableCell className="text-sm">
                {formatDate(booking.expectedReceiveDate)}
              </TableCell>

              <TableCell className="text-sm">
                {formatDate(booking.expectedReturnDate)}
              </TableCell>

              <TableCell className="font-medium">
                {formatCurrency(booking.totalPrice)}
              </TableCell>

              <TableCell>
                <BookingStatusBadge status={booking.status} />
              </TableCell>

              <TableCell className="text-sm text-gray-500">
                {formatDateTime(booking.createdAt)}
              </TableCell>

              <TableCell>
                <Link href={`/staff/bookings/${booking.id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-gray-500">Loading bookings...</div>
      )}

      {/* Empty */}
      {!loading && bookings.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No bookings found matching your filters.
        </div>
      )}
    </div>
  );
}
