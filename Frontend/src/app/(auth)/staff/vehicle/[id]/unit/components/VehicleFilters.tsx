// src/app/(staff)/car/components/CarFilters.tsx
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface Props {
  licensePlate: string;
  importFrom?: string;
  importTo?: string;

  onLicensePlateChange: (v: string) => void;
  onImportFromChange: (v: string) => void;
  onImportToChange: (v: string) => void;
  onReset: () => void;

  total: number;
  filtered: number;
}

export default function CarFilters({
  licensePlate,
  importFrom,
  importTo,
  onLicensePlateChange,
  onImportFromChange,
  onImportToChange,
  onReset,
  total,
  filtered,
}: Props) {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-4">
      {/* License Plate Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search license plate..."
          value={licensePlate}
          onChange={(e) => onLicensePlateChange(e.target.value)}
        />
      </div>

      {/* Import date filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          type="date"
          value={importFrom || ''}
          onChange={(e) => onImportFromChange(e.target.value)}
        />
        <Input
          type="date"
          value={importTo || ''}
          onChange={(e) => onImportToChange(e.target.value)}
        />
      </div>

      {/* Info */}
      <div className="text-sm text-gray-500">
        Showing {filtered} of {total} cars
        {(licensePlate || importFrom || importTo) && (
          <button
            onClick={onReset}
            className="ml-2 text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
