import { Metadata } from 'next';
import { Suspense } from 'react';
import PaymentCancelClient from './PaymentCancelClient';

export const metadata: Metadata = {
  title: 'Payment Cancelled - Car Rental System',
  description: 'Your payment was cancelled or not completed',
};

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentCancelClient />
    </Suspense>
  );
}
