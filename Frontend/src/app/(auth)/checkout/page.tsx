import { Metadata } from 'next';
import { Suspense } from 'react';
import CheckoutClient from './components/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout - Complete Your Booking',
  description: 'Review and complete your vehicle rental booking',
};

function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutClient />
    </Suspense>
  );
}
