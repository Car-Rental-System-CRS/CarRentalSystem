'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

/**
 * Example component showing how to use authentication in client components
 * This can be used in any client component that needs auth state
 */
export default function AuthExample() {
  const { user, accessToken, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center space-y-4">
        <p className="text-gray-600">You are not signed in</p>
        <div className="flex gap-2 justify-center">
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Welcome back!</h2>
      <div className="space-y-2">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>User ID:</strong> {user?.id}</p>
        {accessToken && (
          <p className="text-xs text-gray-500">
            <strong>Token:</strong> {accessToken.substring(0, 20)}...
          </p>
        )}
      </div>
      <Button asChild>
        <Link href="/profile">Go to Profile</Link>
      </Button>
    </div>
  );
}
