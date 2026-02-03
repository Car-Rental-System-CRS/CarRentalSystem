'use client';

import Link from 'next/link';
import {
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Unit = {
  carId: number;
  license: string;
  importDate: string;
};

type SortField = 'license' | 'importDate';
type SortDirection = 'asc' | 'desc';

interface Props {
  units: Unit[];
  vehicleId: number;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onDelete: (carId: number) => void;
  startIndex: number;
}

export default function VehicleUnitsTable({
  units,
  vehicleId,
  sortField,
  sortDirection,
  onSort,
  onDelete,
  startIndex,
}: Props) {
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1" />;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th
              className="py-4 px-6 text-left text-sm font-semibold cursor-pointer"
              onClick={() => onSort('license')}
            >
              License Plate {getSortIcon('license')}
            </th>
            <th
              className="py-4 px-6 text-left text-sm font-semibold cursor-pointer"
              onClick={() => onSort('importDate')}
            >
              Import Date {getSortIcon('importDate')}
            </th>
            <th className="py-4 px-6 text-left text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {units.map((unit) => (
            <tr key={unit.carId} className="hover:bg-gray-50">
              <td className="py-4 px-6">
                <div className="font-semibold text-gray-900">
                  {unit.license}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ID: {unit.carId}
                  </span>
                </div>
              </td>
              <td className="py-4 px-6">{unit.importDate}</td>
              <td className="py-4 px-6">
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/staff/vehicle/${vehicleId}/unit/${unit.carId}/edit`}
                    >
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(unit.carId)}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
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
