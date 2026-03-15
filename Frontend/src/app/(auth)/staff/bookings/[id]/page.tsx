'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { handleError } from '@/lib/errorHandler';

import {
  staffBookingService,
  AdminBookingResponse,
  PostTripInspectionResponse,
} from '@/services/staffBookingService';

import BookingInfoCard from './components/BookingInfoCard';
import BookingCarsCard from './components/BookingCarsCard';
import BookingPriceCard from './components/BookingPriceCard';
import BookingPaymentsCard from './components/BookingPaymentsCard';
import BookingPostTripConditionCard from './components/BookingPostTripConditionCard';
import BookingActions from './components/BookingActions';
import OverdueAlert from './components/OverdueAlert';
import GpsTracker from './components/GpsTracker';

export default function StaffBookingDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [booking, setBooking] = useState<AdminBookingResponse | null>(null);
  const [inspection, setInspection] = useState<PostTripInspectionResponse | null>(null);
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchInspection = async (bookingId: string) => {
    try {
      setInspectionLoading(true);
      const inspectionRes = await staffBookingService.getPostTripInspection(bookingId);
      setInspection(inspectionRes.data.data);
    } catch {
      setInspection(null);
    } finally {
      setInspectionLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await staffBookingService.getById(id);
        const fetchedBooking = res.data.data;
        setBooking(fetchedBooking);

        if (fetchedBooking.status === 'COMPLETED' || fetchedBooking.postTripInspectionCompleted) {
          await fetchInspection(fetchedBooking.id);
        } else {
          setInspection(null);
        }
      } catch (error) {
        handleError(error, 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading booking details...
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Booking not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/staff/bookings')}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Bookings
        </Button>
      </div>
    );
  }

  const handleBookingUpdated = async (updated: AdminBookingResponse) => {
    setBooking(updated);

    if (updated.status === 'COMPLETED' || updated.postTripInspectionCompleted) {
      await fetchInspection(updated.id);
    } else {
      setInspection(null);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <Button variant="outline" size="sm" onClick={() => router.push('/staff/bookings')}>
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Bookings
      </Button>

      {/* Overdue Alert */}
      <OverdueAlert booking={booking} />

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <BookingInfoCard booking={booking} />
          <BookingPostTripConditionCard
            booking={booking}
            inspection={inspection}
            loading={inspectionLoading}
          />
          <BookingCarsCard booking={booking} />

          {/* GPS Tracking — only during IN_PROGRESS */}
          {booking.status === 'IN_PROGRESS' && !booking.actualReturnDate && (
            <GpsTracker
              cars={booking.cars}
              bookingId={booking.id}
            />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <BookingActions booking={booking} onUpdated={handleBookingUpdated} />
          <BookingPriceCard booking={booking} />
          <BookingPaymentsCard booking={booking} />
        </div>
      </div>
    </div>
  );
}
