'use client';

import { AdminBookingResponse } from '@/services/staffBookingService';
import { AlertTriangle } from 'lucide-react';

interface Props {
  booking: AdminBookingResponse;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function OverdueAlert({ booking }: Props) {
  const overdueNotification = booking.notifications?.find(
    (notification) => notification.eventType === 'OVERDUE_WARNING'
  );
  if ((!booking.overdueCharge || booking.overdueCharge <= 0) && !overdueNotification) return null;

  // Calculate overdue duration
  let overdueText = '';
  if (booking.actualReturnDate && booking.expectedReturnDate) {
    const actual = new Date(booking.actualReturnDate).getTime();
    const expected = new Date(booking.expectedReturnDate).getTime();
    const diffMs = actual - expected;
    if (diffMs > 0) {
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      const days = Math.floor(diffHours / 24);
      const hours = diffHours % 24;
      overdueText = days > 0
        ? `The car was returned ${days} day(s) and ${hours} hour(s) late.`
        : `The car was returned ${hours} hour(s) late.`;
    }
  }

  return (
    <div className="bg-orange-50 border border-orange-300 rounded-xl p-5 flex items-start gap-3">
      <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-base font-semibold text-orange-800">
          Overdue Charges: {formatCurrency(booking.overdueCharge ?? 0)}
        </h3>
        {overdueText && (
          <p className="text-sm text-orange-700 mt-1">{overdueText}</p>
        )}
        <p className="text-sm text-orange-600 mt-1">
          An overdue payment transaction has been created. The booking will complete once the renter pays.
        </p>
        {overdueNotification && (
          <p className="text-sm text-orange-700 mt-1">
            Warning email status: {overdueNotification.deliveryStatus}
            {overdueNotification.failureReason ? ` (${overdueNotification.failureReason})` : ''}
          </p>
        )}
      </div>
    </div>
  );
}
