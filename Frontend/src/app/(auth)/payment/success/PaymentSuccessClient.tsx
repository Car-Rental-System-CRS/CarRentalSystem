'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2, Calendar, CreditCard, Car, AlertCircle } from 'lucide-react';
import { getBookingById, type BookingResponse } from '@/services/bookingService';
import {
  getAllPaymentsByBookingId,
  getLatestPaymentByBookingId,
  type PaymentTransactionResponse,
} from '@/services/paymentService';
import { handleError } from '@/lib/errorHandler';
import { format } from 'date-fns';
import Link from 'next/link';
import { PaymentStatusBadge } from '@/components/PaymentStatusBadge';
import { BookingStatusBadge } from '@/components/BookingStatusBadge';

type PaymentPurpose = PaymentTransactionResponse['purpose'];

const PAYMENT_PURPOSES: PaymentPurpose[] = ['BOOKING_PAYMENT', 'FINAL_PAYMENT', 'OVERDUE_PAYMENT'];

const toPaymentPurpose = (value: string | null): PaymentPurpose | null => {
  if (!value) return null;
  return PAYMENT_PURPOSES.includes(value as PaymentPurpose) ? (value as PaymentPurpose) : null;
};

const sortPaymentsByCreatedAtDesc = (payments: PaymentTransactionResponse[]) =>
  [...payments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

const pickPaymentForSuccessPage = (
  payments: PaymentTransactionResponse[],
  preferredPurpose: PaymentPurpose | null
): PaymentTransactionResponse | null => {
  if (payments.length === 0) return null;

  const sorted = sortPaymentsByCreatedAtDesc(payments);

  if (preferredPurpose) {
    const paidMatch = sorted.find(
      (payment) => payment.purpose === preferredPurpose && payment.status === 'PAID'
    );
    if (paidMatch) return paidMatch;

    const anyMatch = sorted.find((payment) => payment.purpose === preferredPurpose);
    if (anyMatch) return anyMatch;
  }

  const latestPaid = sorted.find((payment) => payment.status === 'PAID');
  return latestPaid ?? sorted[0];
};

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const purposeFromQuery = toPaymentPurpose(searchParams.get('purpose'));
  const { data: session, status: sessionStatus } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [payment, setPayment] = useState<PaymentTransactionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // Wait for session to be loaded
      if (sessionStatus === 'loading') {
        return;
      }

      // Check if user is authenticated
      if (sessionStatus === 'unauthenticated' || !session) {
        setError('You must be signed in to view this page');
        setLoading(false);
        return;
      }

      if (!bookingId) {
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch booking details
        const bookingData = await getBookingById(bookingId);
        setBooking(bookingData);

        // Resolve the correct payment to display for this success page.
        const allPayments = await getAllPaymentsByBookingId(bookingId);
        let paymentData = pickPaymentForSuccessPage(allPayments, purposeFromQuery);

        if (!paymentData) {
          paymentData = await getLatestPaymentByBookingId(bookingId);
        }

        setPayment(paymentData);

        // Check if payment is successful
        if (paymentData.status !== 'PAID') {
          setError('Payment has not been completed yet. Please check your payment status.');
        }
      } catch (err) {
        handleError(err, 'Failed to verify payment');
        setError('Unable to verify payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [bookingId, purposeFromQuery, session, sessionStatus]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Verifying Payment...</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error || !booking || !payment) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-6 w-6" />
                Payment Verification Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{error || 'Unable to load booking details'}</p>
              <div className="flex gap-4">
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full">Go to Home</Button>
                </Link>
                {bookingId && (
                  <Link href={`/bookings/${bookingId}`} className="flex-1">
                    <Button className="w-full">View My Bookings</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const paidPurpose = purposeFromQuery ?? payment.purpose;
  const isFinalChargePayment =
    paidPurpose === 'FINAL_PAYMENT' || paidPurpose === 'OVERDUE_PAYMENT';
  const successTitle = isFinalChargePayment
    ? 'Final Settlement Payment Successful!'
    : 'Reservation Payment Successful!';
  const successDescription = isFinalChargePayment
    ? 'Your post-trip settlement payment has been completed.'
    : 'Thank you for your booking. Your reservation is confirmed.';
  const nextSteps = isFinalChargePayment
    ? [
        'No further payment is required for this booking.',
        'You can review the final receipt and booking details in My Bookings.',
        'Contact support if you see any mismatch in the final charge.',
      ]
    : [
        "Please bring a valid ID and driver's license when picking up the vehicle",
        'Arrive at least 15 minutes before your scheduled pickup time',
        'Contact us if you need to modify or cancel your booking',
      ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">{successTitle}</h1>
          <p className="text-xl text-muted-foreground">{successDescription}</p>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
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

            <Separator />

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

            <Separator />

            {/* Vehicles */}
            {booking.cars && booking.cars.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <p className="font-semibold">Vehicles ({booking.cars.length})</p>
                </div>
                <div className="space-y-2">
                  {booking.cars.map((car) => (
                    <div
                      key={car.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{car.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {car.brand} {car.model} • {car.year}
                        </p>
                      </div>
                      <Badge variant="outline">${car.pricePerDay}/day</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Payment ID</p>
                <p className="font-mono text-sm font-semibold">{payment.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <PaymentStatusBadge status={payment.status} />
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Payment Purpose</p>
              <p className="font-semibold">
                {payment.purpose === 'BOOKING_PAYMENT'
                  ? 'Reservation Deposit'
                  : payment.purpose === 'FINAL_PAYMENT'
                  ? 'Final Charge'
                  : 'Overdue Charge'}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Payment Code</p>
                <p className="font-mono text-sm">{payment.payOSPaymentCode}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Date</p>
                <p className="text-sm">
                  {format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total Amount Paid</span>
              <span>${payment.amount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Link href="/" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              Back to Home
            </Button>
          </Link>
          <Link href={`/bookings/${booking.id}`} className="flex-1">
            <Button size="lg" className="w-full">View My Bookings</Button>
          </Link>
        </div>

        {/* Additional Info */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {nextSteps.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
