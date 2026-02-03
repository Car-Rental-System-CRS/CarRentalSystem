import { Metadata } from 'next';
import CheckoutClient from './components/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout - Complete Your Booking',
  description: 'Review and complete your vehicle rental booking',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
