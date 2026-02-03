import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CarType } from '@/types/carType';

type Props = {
  vehicles: CarType[];
  loading?: boolean;
};

export default function VehicleTable({ vehicles, loading = false }: Props) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <Th>Model</Th>
            <Th>Brand</Th>
            <Th>Price</Th>
            <Th>Seats</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {vehicles.map((v) => (
            <tr key={v.id} className="hover:bg-gray-50">
              <td className="py-4 px-6">
                <div className="font-medium">{v.name}</div>
              </td>

              <td className="py-4 px-6">{v.carBrand?.name ?? '—'}</td>

              <td className="py-4 px-6 font-semibold">
                ${v.price.toLocaleString()}
              </td>

              <td className="py-4 px-6">{v.numberOfSeats}</td>

              <td className="py-4 px-6">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/staff/vehicle/${v.id}`}>
                    <Eye className="w-3 h-3 mr-1" />
                    Details
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && vehicles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No car types found
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
      {children}
    </th>
  );
}
