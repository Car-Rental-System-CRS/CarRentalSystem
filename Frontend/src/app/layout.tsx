import type { Metadata } from 'next';
import '@/styles/global.css';
import { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from '@/components/SessionProvider';
import { BookingProvider } from '@/contexts/BookingContext';

export const metadata: Metadata = {
  title: 'Car Rental System',
  description: 'Rent quality vehicles for your journey',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    // ... add more open graph meta tags
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <BookingProvider>
            {children}
            <Toaster richColors closeButton position="top-right" />
          </BookingProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
