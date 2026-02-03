import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function VehicleFilters({
  search,
  brandFilter,
  brandIds,
  getBrandName,
  onSearchChange,
  onBrandChange,
  onReset,
  total,
  filtered,
}: any) {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-3">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search model or brand..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Select value={brandFilter} onValueChange={onBrandChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brandIds.map((id: number) => (
              <SelectItem key={id} value={id.toString()}>
                {getBrandName(id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-gray-500">
        Showing {filtered} of {total} models
        {(search || brandFilter !== 'all') && (
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
