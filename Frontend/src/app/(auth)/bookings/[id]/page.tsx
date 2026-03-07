'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getBookingById, BookingResponse } from '@/services/bookingService';
import { handleError } from '@/lib/errorHandler';
import { BookingStatusBadge } from '@/components/BookingStatusBadge';
import { PaymentStatusBadge } from '@/components/PaymentStatusBadge';
import {
  Calendar,
  DollarSign,
  Car,
  CreditCard,
  Clock,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bookingId = params.id as string;

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true);
        const data = await getBookingById(bookingId);
        setBooking(data);
      } catch (error) {
        handleError(error, 'Failed to load booking details');
        router.push('/bookings');
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId, router]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
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

  const calculateRentalDays = () => {
    if (!booking) return 0;
    try {
      const start = new Date(booking.expectedReceiveDate);
      const end = new Date(booking.expectedReturnDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-6">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Booking not found
            </h2>
            <Link
              href="/bookings"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Bookings
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Booking Details
              </h1>
              <p className="text-gray-600">Booking ID: #{booking.id}</p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rental Period */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Rental Period
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Pick-up Date
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(booking.expectedReceiveDate)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Return Date
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(booking.expectedReturnDate)}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">{calculateRentalDays()}</span>{' '}
                    {calculateRentalDays() === 1 ? 'day' : 'days'} rental period
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-blue-600" />
                Vehicles ({booking.cars.length})
              </h2>
              <div className="space-y-4">
                {booking.cars.map((car) => (
                  <div
                    key={car.id}
                    className="flex flex-col sm:flex-row items-start gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    {car.imageUrl && (
                      <img
                        src={car.imageUrl}
                        alt={car.name}
                        className="w-full sm:w-32 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {car.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {car.brand} {car.model} • {car.year}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Price per day:</span>{' '}
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(car.pricePerDay)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Quantity:</span>{' '}
                          <span className="font-semibold text-gray-900">
                            {car.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            {booking.payments && booking.payments.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Payment History
                </h2>
                <div className="space-y-3">
                  {booking.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900">
                            {payment.purpose === 'BOOKING_PAYMENT'
                              ? 'Booking Deposit'
                              : payment.purpose === 'OVERDUE_PAYMENT'
                                ? 'Overdue Payment'
                                : 'Final Payment'}
                          </p>
                          <PaymentStatusBadge status={payment.status as 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED'} />
                        </div>
                        <p className="text-sm text-gray-600">
                          Transaction ID: #{payment.id.substring(0, 12)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateTime(payment.createdAt)}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        {payment.status === 'PENDING' && payment.paymentUrl && (
                          <a
                            href={payment.paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Pay Now
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Overdue Alert */}
            {booking.overdueCharge != null && booking.overdueCharge > 0 && (
              <div className="bg-orange-50 rounded-lg border border-orange-300 p-5 flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-base font-semibold text-orange-800">
                    Overdue Charges: {formatCurrency(booking.overdueCharge)}
                  </h3>
                  <p className="text-sm text-orange-600 mt-1">
                    Your car was returned late. Please pay the overdue fee to complete your booking.
                  </p>
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Price Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Booking Price</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(booking.bookingPrice)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Deposit (30%)</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(booking.depositAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(booking.remainingAmount)}
                  </span>
                </div>
                {booking.overdueCharge != null && booking.overdueCharge > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span className="font-medium">Overdue Charge (1.5x)</span>
                    <span className="font-semibold">
                      +{formatCurrency(booking.overdueCharge)}
                    </span>
                  </div>
                )}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">
                      Grand Total
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(booking.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Booking Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created On</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(booking.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <BookingStatusBadge status={booking.status} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Need Help?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your booking, please contact our
                support team.
              </p>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
