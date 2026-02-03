'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { BookingItem, BookingContextType, VehicleModel } from '@/types/vehicle';
import { toast } from 'sonner';

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([]);

  const addToBooking = useCallback(
    (vehicle: VehicleModel, startDate: Date, endDate: Date, quantity: number) => {
      // Calculate total days
      const timeDiff = endDate.getTime() - startDate.getTime();
      const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (totalDays <= 0) {
        toast.error('Invalid date range', {
          description: 'End date must be after start date',
        });
        return;
      }

      if (quantity > vehicle.quantity) {
        toast.error('Insufficient quantity', {
          description: `Only ${vehicle.quantity} units available`,
        });
        return;
      }

      const existingItem = bookingItems.find((item) => item.vehicleId === vehicle.id);

      if (existingItem) {
        // Update existing item
        setBookingItems((prev) =>
          prev.map((item) =>
            item.vehicleId === vehicle.id
              ? {
                  ...item,
                  quantity,
                  startDate,
                  endDate,
                  totalDays,
                  totalPrice: vehicle.pricePerDay * totalDays * quantity,
                }
              : item
          )
        );
        toast.success('Booking updated', {
          description: `Updated ${vehicle.carName} in your booking`,
        });
      } else {
        // Add new item
        const newItem: BookingItem = {
          vehicleId: vehicle.id,
          vehicleName: vehicle.carName,
          pricePerDay: vehicle.pricePerDay,
          quantity,
          startDate,
          endDate,
          totalDays,
          totalPrice: vehicle.pricePerDay * totalDays * quantity,
          image: vehicle.image,
        };
        setBookingItems((prev) => [...prev, newItem]);
        toast.success('Added to booking', {
          description: `${vehicle.carName} has been added to your booking`,
        });
      }
    },
    [bookingItems]
  );

  const removeFromBooking = useCallback((vehicleId: string) => {
    setBookingItems((prev) => prev.filter((item) => item.vehicleId !== vehicleId));
    toast.success('Removed from booking');
  }, []);

  const updateBookingQuantity = useCallback((vehicleId: string, quantity: number) => {
    setBookingItems((prev) =>
      prev.map((item) =>
        item.vehicleId === vehicleId
          ? {
              ...item,
              quantity,
              totalPrice: item.pricePerDay * item.totalDays * quantity,
            }
          : item
      )
    );
  }, []);

  const clearBooking = useCallback(() => {
    setBookingItems([]);
    toast.success('Booking cleared');
  }, []);

  const getTotalPrice = useCallback(() => {
    return bookingItems.reduce((total, item) => total + item.totalPrice, 0);
  }, [bookingItems]);

  const getTotalItems = useCallback(() => {
    return bookingItems.reduce((total, item) => total + item.quantity, 0);
  }, [bookingItems]);

  return (
    <BookingContext.Provider
      value={{
        bookingItems,
        addToBooking,
        removeFromBooking,
        updateBookingQuantity,
        clearBooking,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
