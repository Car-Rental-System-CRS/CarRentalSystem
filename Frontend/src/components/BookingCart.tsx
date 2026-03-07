'use client';

import { ShoppingCart, X, Calendar, Car } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useBooking } from '@/contexts/BookingContext';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function BookingCart() {
  const { cartItems, removeFromCart, getTotalPrice, getTotalItems, clearCart } = useBooking();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="default" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {cartItems.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Your Cart ({cartItems.length} booking{cartItems.length !== 1 ? 's' : ''})</SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground">Start adding vehicles to your cart</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold">{item.carTypeName}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Car className="h-3 w-3" />
                      <span>{item.quantity} car{item.quantity > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFromCart(item.id)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(item.pickupDateTime, 'MMM dd, HH:mm')} - {format(item.returnDateTime, 'MMM dd, HH:mm yyyy')}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground">
                  {item.totalDays > 0 && (
                    <span>{item.totalDays} day{item.totalDays !== 1 ? 's' : ''}</span>
                  )}
                  {item.totalDays > 0 && item.remainingHours > 0 && <span> </span>}
                  {item.remainingHours > 0 && (
                    <span>{item.remainingHours} hour{item.remainingHours !== 1 ? 's' : ''}</span>
                  )}
                  <span> × {item.quantity} car{item.quantity > 1 ? 's' : ''}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                  <Link href={`/checkout?cartItemId=${encodeURIComponent(item.id)}`}>
                    <Button size="sm">Checkout</Button>
                  </Link>
                </div>
              </div>
            ))}

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total ({getTotalItems()} cars)</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Each booking must be checked out separately
              </p>
              <Button variant="outline" className="w-full" onClick={clearCart}>
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
