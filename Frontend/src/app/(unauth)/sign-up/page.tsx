import { auth } from '@/lib/auth';
import { Metadata } from 'next';
import SignUpForm from './components/SignUpForm';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Sign Up - Car Rental System',
  description: 'Create an account to start renting cars and enjoy our services',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Sign Up - Car Rental System',
    description: 'Create an account to start renting cars and enjoy our services',
  },
};

export default async function SignUpPage() {
  const session = await auth();

  if (session) {
    redirect('/profile');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <SignUpForm />
      </div>
    </div>
  );
}
