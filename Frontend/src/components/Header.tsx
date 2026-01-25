// components/header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-blue-700 tracking-tight">MIOTO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {/* Regular links */}
            <Link
              href="/about"
              className={cn(
                "text-gray-800 hover:text-blue-600 transition-colors text-lg font-medium",
                pathname === '/about' && "text-blue-600 font-semibold"
              )}
            >
              About Mioto
            </Link>
            
            <Link
              href="/host"
              className={cn(
                "text-gray-800 hover:text-blue-600 transition-colors text-lg font-medium",
                pathname === '/host' && "text-blue-600 font-semibold"
              )}
            >
              Become a Host
            </Link>
            
            {/* Divider */}
            <div className="h-8 w-px bg-gray-300"></div>
            
            {/* Authentication buttons with larger size */}
            <div className="flex items-center gap-4">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-7 text-base font-medium border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50"
              >
                <Link href="/sign-up">
                  Sign Up
                </Link>
              </Button>
              
              <Button
                asChild
                size="lg"
                className="h-12 px-7 text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                <Link href="/sign-in">
                  Sign In
                </Link>
              </Button>
            </div>
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
                href="/about"
                className={cn(
                  "block py-3 px-6 text-lg rounded-lg",
                  pathname === '/about'
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-800 hover:bg-gray-50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Mioto
              </Link>
              
              <Link
                href="/host"
                className={cn(
                  "block py-3 px-6 text-lg rounded-lg",
                  pathname === '/host'
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-800 hover:bg-gray-50"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Become a Host
              </Link>
              
              {/* Divider in mobile */}
              <div className="py-4">
                <div className="h-px bg-gray-300"></div>
              </div>
              
              {/* Authentication buttons */}
              <div className="space-y-4">
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full h-14 text-lg font-medium border-2 border-gray-300"
                >
                  <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
                
                <Button
                  asChild
                  size="lg"
                  className="w-full h-14 text-lg font-medium bg-blue-600 hover:bg-blue-700"
                >
                  <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}