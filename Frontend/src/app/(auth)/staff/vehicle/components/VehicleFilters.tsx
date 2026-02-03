import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { CarBrand } from '@/types/brand';

interface Props {
  search: string;
  brandFilter: string;
  seatFilter: string;
  minPrice: string;
  maxPrice: string;
  brands: CarBrand[];

  onSearchChange: (v: string) => void;
  onBrandChange: (v: string) => void;
  onSeatChange: (v: string) => void;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;
  onReset: () => void;

  total: number;
  filtered: number;
}

export default function VehicleFilters({
  search,
  brandFilter,
  seatFilter,
  minPrice,
  maxPrice,
  brands,
  onSearchChange,
  onBrandChange,
  onSeatChange,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
  total,
  filtered,
}: Props) {

  return (
    <div className="bg-white border rounded-xl p-6 space-y-3">
      <div className="flex gap-4 flex-wrap">
        {/* SEARCH */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search car type or brand..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* BRAND */}
        <Select value={brandFilter} onValueChange={onBrandChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* SEATS */}
        <Select value={seatFilter} onValueChange={onSeatChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Seats" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="4">4</SelectItem>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="7">7+</SelectItem>
          </SelectContent>
        </Select>

        {/* PRICE */}
        <Input
          className="w-[140px]"
          placeholder="Min price"
          type="number"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
        />
        <Input
          className="w-[140px]"
          placeholder="Max price"
          type="number"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
        />
      </div>

      {/* INFO */}
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
