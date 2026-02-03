// components/CarTable.tsx

import Link from 'next/link';
import { Trash2, Pencil } from 'lucide-react';
import { Car } from '@/types/car';
import { Button } from '@/components/ui/Button';

type Props = {
  cars: Car[];
  loading: boolean;
  onDelete: (car: Car) => void;
};

export default function CarTable({ cars, loading, onDelete }: Props) {
  if (loading) {
    return <div className="p-6 text-gray-500">Loading cars...</div>;
  }

  if (cars.length === 0) {
    return <div className="p-6 text-gray-500">No cars found</div>;
  }

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left">License Plate</th>
            <th className="px-4 py-3 text-left">Import Date</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {cars.map((car) => (
            <tr key={car.id} className="border-b last:border-none">
              <td className="px-4 py-3 font-medium">{car.licensePlate}</td>
              <td className="px-4 py-3">{car.importDate}</td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`unit/${car.id}/edit`}>
                      <Pencil className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(car)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
