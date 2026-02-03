'use client';

import Link from 'next/link';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
  vehicle: {
    id: number;
    carName: string;
  };
  search: string;
  onSearchChange: (value: string) => void;
};

export default function VehicleUnitsHeader({
  vehicle,
  search,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href={`/staff/vehicle/${vehicle.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Model
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold">{vehicle.carName} Units</h1>
          <p className="text-gray-500">Manage vehicle units for this model</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search units..."
            className="pl-9 pr-3 py-2 text-sm border rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Add */}
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href={`/staff/vehicle/${vehicle.id}/unit/add`}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Unit
          </Link>
        </Button>
      </div>
    </div>
  );
}
