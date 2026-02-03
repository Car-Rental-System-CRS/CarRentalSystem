import Link from 'next/link';
import { Car, Settings, Trash2, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VehicleActionsCard({
  vehicleId,
  onDelete,
}: {
  vehicleId: string;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

      <div className="space-y-3">
        <Button asChild className="w-full justify-start gap-2">
          <Link href={`/staff/vehicle/${vehicleId}/unit`}>
            <Car className="w-4 h-4" />
            View Vehicle Units
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full justify-start gap-2"
        >
          <Link href={`/staff/vehicle/${vehicleId}/edit`}>
            <Settings className="w-4 h-4" />
            Edit Model Details
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="w-full justify-start gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
        >
          <Link href={`/staff/vehicle/${vehicleId}/feature`}>
            <Wrench className="w-4 h-4" />
            Manage Features
          </Link>
        </Button>

        <Button
          variant="destructive"
          className="w-full justify-start gap-2 mt-4"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4" />
          Delete Model
        </Button>
      </div>
    </div>
  );
}
