'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function UnauthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

  if (isAuthPage) {
    return <div>{children}</div>;
  }

  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
