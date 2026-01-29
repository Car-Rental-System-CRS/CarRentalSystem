import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VehicleHeader({ total }: { total: number }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Vehicle Models</h1>
        <p className="text-gray-500 mt-1">Manage {total} vehicle models</p>
      </div>

      <Button asChild className="bg-blue-600 hover:bg-blue-700">
        <Link href="/staff/vehicle/add">
          <Plus className="w-4 h-4 mr-2" />
          Add New Model
        </Link>
      </Button>
    </div>
  );
}
