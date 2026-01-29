import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function EditHeader({ vehicleId }: { vehicleId: string }) {
  return (
    <div className="flex items-center gap-4">
      <Button asChild variant="outline" size="sm">
        <Link href={`/staff/vehicle/${vehicleId}/unit`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Units
        </Link>
      </Button>
      <h1 className="text-3xl font-bold">Edit Vehicle Unit</h1>
    </div>
  );
}
