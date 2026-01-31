import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  onReset: () => void;
  total: number;
  filtered: number;
}

export default function BrandFilters({
  search,
  onSearchChange,
  onReset,
  total,
  filtered,
}: Props) {
  return (
    <div className="bg-white border rounded-xl p-6 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search brand name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="text-sm text-gray-500">
        Showing {filtered} of {total} brands
        {search && (
          <button
            onClick={onReset}
            className="ml-2 text-blue-600 hover:underline"
          >
            Clear search
          </button>
        )}
      </div>
    </div>
  );
}
