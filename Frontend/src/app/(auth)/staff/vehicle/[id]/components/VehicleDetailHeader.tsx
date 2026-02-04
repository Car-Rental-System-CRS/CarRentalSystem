import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CarType } from '@/types/carType';

export default function VehicleDetailHeader({ vehicle }: { vehicle: CarType }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/staff/vehicle">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Link>
        </Button>

        <div>
          <h1 className="text-3xl font-bold">{vehicle.name}</h1>
          {/* <p className="text-gray-500 mt-1">Model ID: #{vehicle.id}</p> */}
        </div>
      </div>
    </div>
  );
}
