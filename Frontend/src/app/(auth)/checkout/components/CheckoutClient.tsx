'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft, CreditCard, Info } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { createBooking } from '@/services/bookingService';
import { getErrorMessage, handleError } from '@/lib/errorHandler';

// Deposit percentage (should match backend)
const DEPOSIT_PERCENTAGE = 0.30; // 30%

export default function CheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartItemId = searchParams.get('cartItemId');
  
  const { data: session } = useSession();
  const { cartItems, removeFromCart } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);

  // Find the specific cart item to checkout
  const cartItem = useMemo(() => {
    if (!cartItemId) return null;
    return cartItems.find((item) => item.id === decodeURIComponent(cartItemId));
  }, [cartItemId, cartItems]);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  // Auto-fill personal information from session
  useEffect(() => {
    if (session?.user) {
      setFormData({
        fullName: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
      });
    }
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (payNow: boolean) => {
    if (!cartItem) {
      toast.error('No booking item found');
      return;
    }

    setIsProcessing(true);

    try {
      // Create booking via API
      const bookingResponse = await createBooking({
        carTypeId: cartItem.carTypeId,
        quantity: cartItem.selectedCarIds?.length || cartItem.quantity,
        selectedCarIds: cartItem.selectedCarIds,
        expectedReceiveDate: cartItem.pickupDateTime.toISOString(),
        expectedReturnDate: cartItem.returnDateTime.toISOString(),
        payNow,
      });

      // Remove item from cart after successful booking
      removeFromCart(cartItem.id);

      if (payNow) {
        // Redirect to payment URL
        const paymentUrl = bookingResponse.payments?.[0]?.paymentUrl;
        
        if (paymentUrl) {
          toast.success('Booking created!', {
            description: 'Redirecting to payment...',
          });
          setTimeout(() => {
            window.location.href = paymentUrl;
          }, 1000);
        } else {
          // Fallback if no payment URL
          toast.success('Booking created!');
          router.push(`/payment/success?bookingId=${bookingResponse.id}`);
        }
      } else {
        // Pay later - redirect to bookings page
        toast.success('Booking created successfully!', {
          description: 'You can pay later from your bookings page.',
        });
        router.push(`/bookings/${bookingResponse.id}`);
      }
    } catch (error) {
      const message = getErrorMessage(error);
      if (message.toLowerCase().includes('no longer available')) {
        toast.error('Selected cars are no longer available', {
          description: 'Please re-select available cars for your booking period.',
        });
        router.push(`/vehicles/${cartItem.carTypeId}`);
        return;
      }
      handleError(error, 'Failed to create booking');
    } finally {
      setIsProcessing(false);
    }
  };

  // No cart item ID provided
  if (!cartItemId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">No booking selected</h1>
          <p className="text-muted-foreground mb-8">Please select a booking from your cart to checkout.</p>
          <Link href="/vehicles">
            <Button size="lg">Browse Vehicles</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Cart item not found
  if (!cartItem) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold mb-4">Booking not found</h1>
          <p className="text-muted-foreground mb-8">This booking may have been removed or already checked out.</p>
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
        {/* Left Column - Form & Actions */}
        <div className="lg:col-span-2 space-y-6">
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
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+84 123 456 789"
                  disabled
                  className="bg-muted"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Options */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Options</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                <Info className="h-4 w-4 inline mr-1" />
                A {(DEPOSIT_PERCENTAGE * 100).toFixed(0)}% deposit is required to confirm your booking
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Button
                  size="lg"
                  className="h-auto py-6 flex flex-col gap-2"
                  onClick={() => handleSubmit(true)}
                  disabled={isProcessing}
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="font-semibold">Pay Deposit Now</span>
                  <span className="text-sm opacity-80">
                    ${(cartItem.totalPrice * DEPOSIT_PERCENTAGE).toFixed(2)} (30%)
                  </span>
                </Button>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Total booking price</span>
                  <span className="font-medium">${cartItem.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-primary">
                  <span>Deposit ({(DEPOSIT_PERCENTAGE * 100).toFixed(0)}%)</span>
                  <span className="font-medium">${(cartItem.totalPrice * DEPOSIT_PERCENTAGE).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Remaining (due at pickup)</span>
                  <span>${(cartItem.totalPrice * (1 - DEPOSIT_PERCENTAGE)).toFixed(2)}</span>
                </div>
              </div>

              {isProcessing && (
                <p className="text-center text-muted-foreground">Processing your booking...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{cartItem.carTypeName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {cartItem.quantity} car{cartItem.quantity > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant="secondary">${cartItem.pricePerHour}/hr</Badge>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Pickup</p>
                      <p className="text-muted-foreground">
                        {format(cartItem.pickupDateTime, 'MMM dd, yyyy - HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Return</p>
                      <p className="text-muted-foreground">
                        {format(cartItem.returnDateTime, 'MMM dd, yyyy - HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span>
                      {cartItem.totalDays > 0 && `${cartItem.totalDays} day${cartItem.totalDays !== 1 ? 's' : ''} `}
                      {cartItem.remainingHours > 0 && `${cartItem.remainingHours} hr${cartItem.remainingHours !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cars</span>
                    <span>{cartItem.quantity}</span>
                  </div>
                  {cartItem.totalDays > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Day rate × {cartItem.totalDays}</span>
                      <span>${(cartItem.pricePerDay * cartItem.totalDays * cartItem.quantity).toFixed(2)}</span>
                    </div>
                  )}
                  {cartItem.remainingHours > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Hourly rate × {cartItem.remainingHours}</span>
                      <span>${(cartItem.pricePerHour * cartItem.remainingHours * cartItem.quantity).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${cartItem.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary font-medium">
                    <span>Deposit (30%)</span>
                    <span>${(cartItem.totalPrice * DEPOSIT_PERCENTAGE).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Due at pickup</span>
                    <span>${(cartItem.totalPrice * (1 - DEPOSIT_PERCENTAGE)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1 pt-2">
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
