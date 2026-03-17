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
  formatDateTime,
  getPaymentPurposeLabel,
  getPaymentStatusClasses,
} from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { RecentPayment } from '@/types/dashboard';

export function RecentPaymentsPanel({
  payments,
}: {
  payments: RecentPayment[];
}) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardHeader className="space-y-1 border-b border-slate-100">
        <CardTitle className="text-lg text-slate-900">Recent payments</CardTitle>
        <CardDescription>
          Review recent transaction outcomes, payment purpose, and related
          booking references.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {payments.length === 0 ? (
          <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
            No recent payments in this reporting period.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium text-slate-900">
                    #{payment.bookingId}
                  </TableCell>
                  <TableCell>{getPaymentPurposeLabel(payment.purpose)}</TableCell>
                  <TableCell className="text-slate-600">
                    {formatDateTime(payment.createdAt)}
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
                        getPaymentStatusClasses(payment.status)
                      )}
                    >
                      {payment.status.replace(/_/g, ' ')}
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
