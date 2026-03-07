'use client';

import {
  Clock,
  CheckCircle,
  PlayCircle,
  CheckSquare,
  XCircle,
} from 'lucide-react';
import { AdminBookingResponse } from '@/services/staffBookingService';

interface Props {
  bookings: AdminBookingResponse[];
  total: number;
}

export default function BookingStats({ bookings, total }: Props) {
  // Count statuses from the current page (the total count comes from the server)
  const stats = [
    {
      label: 'Total Bookings',
      value: total,
      icon: CheckSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Created',
      value: bookings.filter((b) => b.status === 'CREATED').length,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Confirmed',
      value: bookings.filter((b) => b.status === 'CONFIRMED').length,
      icon: CheckCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'In Progress',
      value: bookings.filter((b) => b.status === 'IN_PROGRESS').length,
      icon: PlayCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Canceled',
      value: bookings.filter((b) => b.status === 'CANCELED').length,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white border rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`${stat.bg} p-2 rounded-lg`}>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
