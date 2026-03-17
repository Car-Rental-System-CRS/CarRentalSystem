'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatCurrency,
  formatShortDate,
  getBookingStatusClasses,
} from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { RecentBooking } from '@/types/dashboard';

export function RecentBookingsPanel({
  bookings,
}: {
  bookings: RecentBooking[];
}) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader className="space-y-1 border-b border-slate-100">
        <CardTitle className="text-lg text-slate-900">Recent bookings</CardTitle>
        <CardDescription>
          Identify high-value or unusual reservations and jump into the detail
          flow directly.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {bookings.length === 0 ? (
          <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            No recent bookings in this reporting period.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Rental window</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium text-slate-900">
                    {booking.customerName}
                  </TableCell>
                  <TableCell>{booking.carTypeName || 'Unassigned vehicle'}</TableCell>
                  <TableCell className="text-slate-600">
                    {formatShortDate(booking.expectedReceiveDate)} -{' '}
                    {formatShortDate(booking.expectedReturnDate)}
                  </TableCell>
                  <TableCell>{formatCurrency(booking.totalPrice)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
                        getBookingStatusClasses(booking.status)
                      )}
                    >
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
