// components/header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Menu, X, User, LogOut, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';
import { signOut } from 'next-auth/react';
import { BookingCart } from '@/components/BookingCart';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut({ redirectTo: '/' });
  };

  const getInitial = (name: string | undefined) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const getAvatarColor = (name: string | undefined) => {
    if (!name) return 'bg-gray-500';
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-blue-700 tracking-tight">
              EcoDrive
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {/* Regular links */}
            <Link
              href="/vehicles"
              className={cn(
                'text-gray-800 hover:text-blue-600 transition-colors text-lg font-medium',
                pathname.startsWith('/vehicles') && 'text-blue-600 font-semibold'
              )}
            >
              Vehicles
            </Link>

            <Link
              href="/about-us"
              className={cn(
                'text-gray-800 hover:text-blue-600 transition-colors text-lg font-medium',
                pathname === '/about-us' && 'text-blue-600 font-semibold'
              )}
            >
              About EcoDrive
            </Link>

            {/* Booking Cart */}
            <BookingCart />

            {/* Divider */}
            <div className="h-8 w-px bg-gray-300"></div>

            {/* Authentication buttons or User Avatar */}
            {isLoading ? (
              <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
            ) : isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md',
                    getAvatarColor(user.name)
                  )}>
                    {getInitial(user.name)}
                  </div>
                  <span className="text-gray-800 font-medium">{user.name}</span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/bookings"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>My Bookings</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleSignOut();
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 px-7 text-base font-medium border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Link href="/sign-up">Sign Up</Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  className="h-12 px-7 text-base font-medium bg-blue-600 hover:bg-blue-700"
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="lg"
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-8 h-8" />
            ) : (
              <Menu className="w-8 h-8" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-6">
            <div className="space-y-4">
              {/* Regular nav items */}
              <Link
                href="/vehicles"
                className={cn(
                  'block py-3 px-6 text-lg rounded-lg',
                  pathname.startsWith('/vehicles')
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-800 hover:bg-gray-50'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Vehicles
              </Link>

              <Link
                href="/about-us"
                className={cn(
                  'block py-3 px-6 text-lg rounded-lg',
                  pathname === '/about-us'
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-800 hover:bg-gray-50'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>

              {/* Divider in mobile */}
              <div className="py-4">
                <div className="h-px bg-gray-300"></div>
              </div>

              {/* Authentication section */}
              {isLoading ? (
                <div className="px-6 py-4">
                  <div className="w-full h-14 rounded-lg bg-gray-200 animate-pulse"></div>
                </div>
              ) : isAuthenticated && user ? (
                <div className="space-y-4 px-6">
                  {/* User Info */}
                  <div className="flex items-center gap-3 py-3">
                    <div className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-md',
                      getAvatarColor(user.name)
                    )}>
                      {getInitial(user.name)}
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Mobile menu actions */}
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full h-14 text-lg font-medium border-2 border-gray-300"
                  >
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      My Profile
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full h-14 text-lg font-medium border-2 border-gray-300"
                  >
                    <Link
                      href="/bookings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      My Bookings
                    </Link>
                  </Button>

                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleSignOut();
                    }}
                    size="lg"
                    variant="outline"
                    className="w-full h-14 text-lg font-medium border-2 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="w-full h-14 text-lg font-medium border-2 border-gray-300"
                  >
                    <Link
                      href="/sign-up"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </Button>

                  <Button
                    asChild
                    size="lg"
                    className="w-full h-14 text-lg font-medium bg-blue-600 hover:bg-blue-700"
                  >
                    <Link
                      href="/sign-in"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
