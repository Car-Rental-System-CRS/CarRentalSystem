'use client';

import { AdminBookingResponse } from '@/services/staffBookingService';
import { PaymentStatusBadge } from '@/components/PaymentStatusBadge';
import { CreditCard, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  booking: AdminBookingResponse;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function BookingPaymentsCard({ booking }: Props) {
  const completionNotification = booking.notifications?.find(
    (notification) => notification.eventType === 'BOOKING_COMPLETED'
  );
  const payments = booking.payments ?? [];

  if (payments.length === 0 && !completionNotification) return null;

  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-purple-600" />
        Payment Transactions ({booking.payments.length})
      </h3>

      {completionNotification && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Completion email status: <span className="font-semibold">{completionNotification.deliveryStatus}</span>
          {completionNotification.failureReason ? ` (${completionNotification.failureReason})` : ''}
        </div>
      )}

      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-gray-50 rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="space-y-1 min-w-0">
              <span className="text-sm font-medium text-gray-900">
                {payment.purpose.replace(/_/g, ' ')}
              </span>
              <div className="text-xs text-gray-500">
                Method: {payment.paymentMethod}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(payment.createdAt).toLocaleString('vi-VN')}
              </div>
              {payment.paymentUrl && payment.status === 'PENDING' && (
                <a
                  href={payment.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="mt-1 h-7 text-xs">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Payment Link
                  </Button>
                </a>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap sm:justify-end sm:self-center">
              <span className="text-sm font-semibold shrink-0">
                {formatCurrency(payment.amount)}
              </span>
              <PaymentStatusBadge
                status={payment.status as 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED'}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
