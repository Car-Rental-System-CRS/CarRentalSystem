'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { XCircle, Loader2, AlertTriangle, Calendar, CreditCard } from 'lucide-react';
import { getBookingById, type BookingResponse } from '@/services/bookingService';
import { getLatestPaymentByBookingId, type PaymentTransactionResponse } from '@/services/paymentService';
import { handleError } from '@/lib/errorHandler';
import { format } from 'date-fns';
import Link from 'next/link';
import { PaymentStatusBadge } from '@/components/PaymentStatusBadge';
import { BookingStatusBadge } from '@/components/BookingStatusBadge';

export default function PaymentCancelClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const { data: session, status: sessionStatus } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [payment, setPayment] = useState<PaymentTransactionResponse | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      // Wait for session to be loaded
      if (sessionStatus === 'loading') {
        return;
      }

      // Check if user is authenticated
      if (sessionStatus === 'unauthenticated' || !session) {
        setLoading(false);
        return;
      }

      if (!bookingId) {
        setLoading(false);
        return;
      }

      try {
        const bookingData = await getBookingById(bookingId);
        setBooking(bookingData);

        const paymentData = await getLatestPaymentByBookingId(bookingId);
        setPayment(paymentData);
      } catch (err) {
        handleError(err, 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [bookingId, session, sessionStatus]);

  const handleRetryPayment = () => {
    if (payment?.paymentUrl) {
      window.location.href = payment.paymentUrl;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Error Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Payment Cancelled</h1>
          <p className="text-xl text-muted-foreground">
            Your payment was not completed. Your booking is still pending.
          </p>
        </div>

        {/* What Happened Card */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              What Happened?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Your payment was cancelled or interrupted. This could happen if:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>You clicked the cancel or back button on the payment page</li>
              <li>The payment session expired</li>
              <li>There was a connection issue during payment</li>
              <li>Payment was declined by your bank</li>
            </ul>
          </CardContent>
        </Card>

        {/* Booking Details */}
        {booking && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Booking Details (Pending Payment)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="font-mono text-sm font-semibold">{booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <BookingStatusBadge status={booking.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pickup Date</p>
                    <p className="font-semibold">
                      {format(new Date(booking.expectedReceiveDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Return Date</p>
                    <p className="font-semibold">
                      {format(new Date(booking.expectedReturnDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-lg font-bold pt-4 border-t">
                <span>Total Amount</span>
                <span>${booking.totalPrice.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Status */}
        {payment && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Payment ID</p>
                  <p className="font-mono text-sm">{payment.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <PaymentStatusBadge status={payment.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-4">
          {payment?.paymentUrl && payment.status === 'PENDING' && (
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleRetryPayment}
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Retry Payment
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/">
              <Button variant="outline" size="lg" className="w-full">
                Back to Home
              </Button>
            </Link>
            <Link href="/profile/bookings">
              <Button variant="outline" size="lg" className="w-full">
                View My Bookings
              </Button>
            </Link>
          </div>
        </div>

        {/* Help Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Your booking is reserved for 24 hours pending payment</li>
              <li>• You can retry payment anytime within this period</li>
              <li>• Contact support if you're experiencing payment issues</li>
              <li>• Check with your bank if payment was declined</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
