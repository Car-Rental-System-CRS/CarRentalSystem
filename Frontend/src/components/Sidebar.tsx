// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car, Sliders, Tag, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Sidebar() {
  const pathname = usePathname();
  const { scopes } = useAuth();

  const allNavItems = [
    {
      name: 'Vehicle Management',
      href: '/staff/vehicle',
      icon: Car,
      requiredScope: 'CAR_TYPE_VIEW',
    },
    {
      name: 'Feature Management',
      href: '/staff/feature',
      icon: Sliders,
      requiredScope: 'CAR_FEATURE_VIEW',
    },
    {
      name: 'Brand Management',
      href: '/staff/brand',
      icon: Tag,
      requiredScope: 'CAR_BRAND_VIEW',
    },
    {
      name: 'Booking Management',
      href: '/staff/bookings',
      icon: ClipboardList,
      requiredScope: 'BOOKING_MANAGE',
    },
  ];

  // Filter nav items by user's scopes (if no scopes yet, show all to avoid flash)
  const navItems = scopes && scopes.length > 0
    ? allNavItems.filter((item) => scopes.includes(item.requiredScope))
    : allNavItems;

  return (
    <div className="pt-16 h-screen">
      <aside className="w-64 bg-white border-r h-screen flex flex-col">
        <div className="flex-1 fixed overflow-y-auto">
          <nav className="px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-medium border border-blue-100'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      isActive ? 'text-blue-600' : 'text-gray-500'
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </div>
  );
}
