import { Metadata } from 'next';
import { Suspense } from 'react';
import PaymentSuccessClient from './PaymentSuccessClient';

export const metadata: Metadata = {
  title: 'Payment Successful - Car Rental System',
  description: 'Your payment has been processed successfully',
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessClient />
    </Suspense>
  );
}
