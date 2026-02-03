'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft, Check } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { createBooking, type BookingResponse } from '@/services/bookingService';
import { handleError } from '@/lib/errorHandler';

export default function CheckoutClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const { bookingItems, getTotalPrice, clearBooking } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (bookingItems.length === 0) {
      toast.info('Your booking is empty', {
        description: 'Please add vehicles to your booking first',
      });
    }
  }, [bookingItems]);

  // Auto-fill personal information from session
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        fullName: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
      }));
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Validate we have booking items
      if (bookingItems.length === 0) {
        toast.error('No vehicles selected', {
          description: 'Please add vehicles to your booking',
        });
        setIsProcessing(false);
        return;
      }

      // Group vehicles by date range (as backend expects one date range per booking)
      // For simplicity, we'll create separate bookings for different date ranges
      const bookingsByDateRange = new Map<string, typeof bookingItems>();
      
      bookingItems.forEach((item) => {
        const key = `${item.startDate.toISOString()}-${item.endDate.toISOString()}`;
        if (!bookingsByDateRange.has(key)) {
          bookingsByDateRange.set(key, []);
        }
        bookingsByDateRange.get(key)!.push(item);
      });

      // Format date helper
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Create bookings for each date range
      const createdBookings: BookingResponse[] = [];
      
      for (const [_, items] of bookingsByDateRange) {
        // Collect all car IDs for this date range, respecting quantity
        const carIds: string[] = [];
        items.forEach((item) => {
          // Add the car ID 'quantity' times (since backend expects array of IDs)
          for (let i = 0; i < item.quantity; i++) {
            carIds.push(item.vehicleId);
          }
        });

        const firstItem = items[0];
        
        // Create booking via API
        const bookingResponse = await createBooking({
          carIds,
          expectedReceiveDate: formatDate(firstItem.startDate),
          expectedReturnDate: formatDate(firstItem.endDate),
        });

        createdBookings.push(bookingResponse);
      }

      // Store the first booking ID (or you could store all)
      setBookingId(createdBookings[0].id);

      // Show success message
      if (createdBookings.length === 1) {
        const booking = createdBookings[0];
        const paymentUrl = booking.payments?.[0]?.paymentUrl;
        
        toast.success('Booking confirmed!', {
          description: `Redirecting to payment...`,
        });

        // Clear booking context
        clearBooking();

        // Redirect to payment URL if available
        setTimeout(() => {
          if (paymentUrl) {
            // Add booking ID as query param for return URL
            const urlWithParams = `${paymentUrl}${paymentUrl.includes('?') ? '&' : '?'}bookingId=${booking.id}`;
            window.location.href = urlWithParams;
          } else {
            // Fallback to success page if no payment URL
            router.push(`/payment/success?bookingId=${booking.id}`);
          }
        }, 1500);
      } else {
        toast.success('Bookings confirmed!', {
          description: `${createdBookings.length} bookings have been created successfully`,
        });
        
        // Clear booking context
        clearBooking();
        
        // For multiple bookings, redirect to first payment
        setTimeout(() => {
          const firstBooking = createdBookings[0];
          const firstPaymentUrl = firstBooking.payments?.[0]?.paymentUrl;
          if (firstPaymentUrl) {
            const urlWithParams = `${firstPaymentUrl}${firstPaymentUrl.includes('?') ? '&' : '?'}bookingId=${firstBooking.id}`;
            window.location.href = urlWithParams;
          } else {
            router.push(`/payment/success?bookingId=${firstBooking.id}`);
          }
        }, 1500);
      }
    } catch (error) {
      handleError(error, 'Failed to create booking');
    } finally {
      setIsProcessing(false);
    }
  };

  if (bookingItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Your booking is empty</h1>
          <p className="text-muted-foreground mb-8">Add some vehicles to your booking to proceed with checkout.</p>
          <Link href="/vehicles">
            <Button size="lg">Browse Vehicles</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/vehicles">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vehicles
        </Button>
      </Link>

      <h1 className="text-4xl font-bold mb-8">Complete Your Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="John Doe"
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="john@example.com"
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="+1 (555) 123-4567"
                    disabled
                    className="bg-muted"
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={isProcessing}>
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Confirm & Pay ${getTotalPrice().toFixed(2)}
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookingItems.map((item) => (
                <div key={item.vehicleId} className="space-y-2 pb-4 border-b last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{item.vehicleName}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <Badge>${item.pricePerDay}/day</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(item.startDate, 'MMM dd')} - {format(item.endDate, 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>
                      {item.totalDays} {item.totalDays === 1 ? 'day' : 'days'} × {item.quantity} vehicle(s)
                    </span>
                    <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span>${(getTotalPrice() * 0.1).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>$25.00</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${(getTotalPrice() * 1.1 + 25).toFixed(2)}</span>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Free cancellation up to 24 hours before pickup</p>
                <p>• Full insurance coverage included</p>
                <p>• 24/7 roadside assistance</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
