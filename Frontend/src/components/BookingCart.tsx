'use client';

import { ShoppingCart, X, Calendar, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useBooking } from '@/contexts/BookingContext';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function BookingCart() {
  const { bookingItems, removeFromBooking, updateBookingQuantity, getTotalPrice, getTotalItems, clearBooking } =
    useBooking();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Your Booking ({getTotalItems()} vehicles)</SheetTitle>
        </SheetHeader>

        {bookingItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your booking is empty</h3>
            <p className="text-sm text-muted-foreground">Start adding vehicles to your booking</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {bookingItems.map((item) => (
              <div key={item.vehicleId} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.vehicleName}</h4>
                    <p className="text-sm text-muted-foreground">${item.pricePerDay}/day</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromBooking(item.vehicleId)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(item.startDate, 'MMM dd')} - {format(item.endDate, 'MMM dd, yyyy')} ({item.totalDays}{' '}
                    {item.totalDays === 1 ? 'day' : 'days'})
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateBookingQuantity(item.vehicleId, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateBookingQuantity(item.vehicleId, item.quantity + 1)}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${item.totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <Link href="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={clearBooking}>
                Clear Booking
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
