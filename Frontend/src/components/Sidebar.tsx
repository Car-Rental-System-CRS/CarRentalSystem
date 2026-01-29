// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Car, Users, Settings, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/staff/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Vehicle Management',
      href: '/staff/vehicle',
      icon: Car,
    },
    {
      name: 'Users',
      href: '/staff/user',
      icon: Users,
    },
    {
      name: 'Settings',
      href: '/staff/setting',
      icon: Settings,
    },
  ];

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
