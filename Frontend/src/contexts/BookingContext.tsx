'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CartItem } from '@/types/booking';
import { BookingContextType } from '@/types/vehicle';
import { toast } from 'sonner';

const MINIMUM_RENTAL_HOURS = 5;
const CART_STORAGE_KEY = 'car-rental-cart';

const BookingContext = createContext<BookingContextType | undefined>(undefined);

/**
 * Generate unique cart item ID based on carTypeId + pickup + return datetime
 */
const generateCartItemId = (carTypeId: string, pickup: Date, returnDt: Date): string => {
  return `${carTypeId}_${pickup.toISOString()}_${returnDt.toISOString()}`;
};

/**
 * Calculate pricing breakdown
 */
const calculatePricing = (
  pricePerHour: number,
  pickup: Date,
  returnDt: Date,
  quantity: number
): { totalHours: number; totalDays: number; remainingHours: number; totalPrice: number } => {
  const totalMinutes = (returnDt.getTime() - pickup.getTime()) / (1000 * 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalMinutes / (24 * 60));
  const remainingHours = Math.floor((totalMinutes % (24 * 60)) / 60);
  
  const pricePerDay = pricePerHour * 24;
  const totalPrice = (totalDays * pricePerDay + remainingHours * pricePerHour) * quantity;
  
  return { totalHours, totalDays, remainingHours, totalPrice };
};

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const items = parsed.map((item: CartItem) => ({
          ...item,
          pickupDateTime: new Date(item.pickupDateTime),
          returnDateTime: new Date(item.returnDateTime),
        }));
        setCartItems(items);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [cartItems, isInitialized]);

  const addToCart = useCallback(
    (item: Omit<CartItem, 'id'>): boolean => {
      const id = generateCartItemId(item.carTypeId, item.pickupDateTime, item.returnDateTime);

      // Check if already exists
      const existing = cartItems.find((i) => i.id === id);
      if (existing) {
        toast.error('This booking already exists in your cart', {
          description: 'Same car type with same pickup and return time is already added.',
        });
        return false;
      }

      // Validate minimum 5 hours
      const hours = (item.returnDateTime.getTime() - item.pickupDateTime.getTime()) / (1000 * 60 * 60);
      if (hours < MINIMUM_RENTAL_HOURS) {
        toast.error('Minimum rental period is 5 hours', {
          description: `Current duration: ${Math.floor(hours)} hours`,
        });
        return false;
      }

      // Add to cart
      const newItem: CartItem = { ...item, id };
      setCartItems((prev) => [...prev, newItem]);
      toast.success('Added to cart', {
        description: `${item.carTypeName} (${item.quantity} car${item.quantity > 1 ? 's' : ''}) has been added.`,
      });
      return true;
    },
    [cartItems]
  );

  const removeFromCart = useCallback((cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    toast.success('Removed from cart');
  }, []);

  const getCartItem = useCallback(
    (carTypeId: string, pickupDateTime: Date, returnDateTime: Date): CartItem | undefined => {
      const id = generateCartItemId(carTypeId, pickupDateTime, returnDateTime);
      return cartItems.find((item) => item.id === id);
    },
    [cartItems]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.success('Cart cleared');
  }, []);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  }, [cartItems]);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  return (
    <BookingContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        getCartItem,
        clearCart,
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

// Export utility functions for use in other components
export { generateCartItemId, calculatePricing, MINIMUM_RENTAL_HOURS };
