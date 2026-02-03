import Link from 'next/link';
import { Car, Settings, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VehicleActionsCard({
  vehicleId,
  quantity,
  onDelete,
}: {
  vehicleId: number;
  quantity: number;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

      <div className="space-y-3">
        <Button asChild className="w-full justify-start">
          <Link href={`/staff/vehicle/${vehicleId}/unit`}>
            <Car className="w-4 h-4 mr-2" />
            View Vehicle Units ({quantity})
          </Link>
        </Button>

        <Button asChild variant="outline" className="w-full justify-start">
          <Link href={`/staff/vehicle/${vehicleId}/edit`}>
            <Settings className="w-4 h-4 mr-2" />
            Edit Model Details
          </Link>
        </Button>

        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={onDelete}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Model
        </Button>
      </div>
    </div>
  );
}
