import Link from 'next/link';
import { Eye, List, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VehicleTable({
  vehicles,
  getBrandName,
  sortField,
  sortDirection,
  onSortChange,
}: any) {
  const icon = (f: string) => {
    if (sortField !== f) return <ArrowUpDown className="w-3 h-3 ml-1" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <Th onClick={() => onSortChange('carName')}>
              Model {icon('carName')}
            </Th>
            <Th onClick={() => onSortChange('brandName')}>
              Brand {icon('brandName')}
            </Th>
            <Th onClick={() => onSortChange('pricePerDay')}>
              Daily Rate {icon('pricePerDay')}
            </Th>
            <Th onClick={() => onSortChange('quantity')}>
              Quantity {icon('quantity')}
            </Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {vehicles.map((v: any) => (
            <tr key={v.id} className="hover:bg-gray-50">
              <td className="py-4 px-6">
                <div className="font-medium">{v.carName}</div>
                <div className="text-xs text-gray-500">ID #{v.id}</div>
              </td>
              <td className="py-4 px-6">{getBrandName(v.brandId)}</td>
              <td className="py-4 px-6 font-semibold">${v.pricePerDay}/day</td>
              <td className="py-4 px-6">{v.quantity}</td>
              <td className="py-4 px-6 flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/staff/vehicle/${v.id}`}>
                    <Eye className="w-3 h-3 mr-1" /> Details
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/staff/vehicle/${v.id}/unit`}>
                    <List className="w-3 h-3 mr-1" /> Units
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {vehicles.length === 0 && (
        <div className="text-center py-12 text-gray-500">No vehicles found</div>
      )}
    </div>
  );
}

function Th({ children, onClick }: any) {
  return (
    <th
      onClick={onClick}
      className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
    >
      {children}
    </th>
  );
}
