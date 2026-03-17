// components/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Shield, LayoutDashboard, TicketPercent } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/hooks/useAuth';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { hasScope } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      scope: 'DASHBOARD_VIEW',
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      scope: 'USER_VIEW',
    },
    {
      name: 'Role Management',
      href: '/admin/roles',
      icon: Shield,
      scope: 'ROLE_VIEW',
    },
    {
      name: 'Discount Campaigns',
      href: '/admin/discount-campaigns',
      icon: TicketPercent,
      scope: 'DISCOUNT_CAMPAIGN_MANAGE',
    },
  ].filter((item) => hasScope(item.scope));

  return (
    <div className="pt-16 h-screen">
      <aside className="w-64 bg-white border-r h-screen flex flex-col">
        <div className="flex-1 fixed overflow-y-auto">
          <div className="px-4 pt-6 pb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Admin Panel
            </span>
          </div>
          <nav className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-medium border border-purple-100'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      isActive ? 'text-purple-600' : 'text-gray-500'
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
