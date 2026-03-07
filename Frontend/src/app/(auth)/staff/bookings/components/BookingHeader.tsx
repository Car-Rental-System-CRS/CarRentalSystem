'use client';

import { ClipboardList } from 'lucide-react';

interface Props {
  total: number;
}

export default function BookingHeader({ total }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-7 h-7 text-blue-600" />
          Booking Management
        </h1>
        <p className="text-gray-500 mt-1">
          View and manage all customer bookings ({total} total)
        </p>
      </div>
    </div>
  );
}
