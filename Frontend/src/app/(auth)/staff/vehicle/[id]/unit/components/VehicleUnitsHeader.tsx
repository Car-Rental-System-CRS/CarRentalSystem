'use client';

import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
  vehicle: {
    id: number;
    carName: string;
  };
};

export default function VehicleUnitsHeader({ vehicle }: Props) {
  return (
    <div className="flex items-center justify-between">
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

      <Button asChild className="bg-blue-600 hover:bg-blue-700">
        <Link href={`/staff/vehicle/${vehicle.id}/unit/add`}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Unit
        </Link>
      </Button>
    </div>
  );
}
