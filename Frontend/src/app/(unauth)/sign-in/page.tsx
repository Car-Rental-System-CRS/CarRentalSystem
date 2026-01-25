import { auth } from '@/lib/auth';

import { Metadata } from 'next';
import Link from 'next/link';
import SignInForm from './components/SignInForm';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Sign In - Car Rental System',
  description: 'Sign in to your account to rent cars and manage your bookings',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Sign In - Car Rental System',
    description: 'Sign in to your account to rent cars and manage your bookings',
  },
};

export default async function SignInPage() {
  const session = await auth();

  if (session) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <SignInForm />
        
        {/* Additional info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
