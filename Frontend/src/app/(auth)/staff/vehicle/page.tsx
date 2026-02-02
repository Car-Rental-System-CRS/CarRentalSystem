'use client';

import { useState, useMemo, useEffect } from 'react';
import { vehicleModels } from '@/data/vehicles';
import { brands } from '@/data/brands';

import VehicleHeader from './components/VehicleHeader';
import VehicleStats from './components/VehicleStats';
import VehicleFilters from './components/VehicleFilters';
import VehicleTable from './components/VehicleTable';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 10;

type SortField = 'carName' | 'brandName' | 'pricePerDay' | 'quantity';
type SortDirection = 'asc' | 'desc';

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [sortField, setSortField] = useState<SortField>('carName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  /* ---------- HELPERS ---------- */
  const getBrandName = (brandId: number) =>
    brands.find((b) => b.id === brandId)?.name || 'Unknown';

  const vehicleBrandIds = useMemo(
    () => Array.from(new Set(vehicleModels.map((v) => v.brandId))),
    []
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, brandFilter]);

  /* ---------- FILTER ---------- */
  const filtered = useMemo(() => {
    return vehicleModels.filter((v) => {
      const brandName = getBrandName(v.brandId);

      const matchesSearch = `${v.carName} ${brandName}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesBrand =
        brandFilter === 'all' || v.brandId.toString() === brandFilter;

      return matchesSearch && matchesBrand;
    });
  }, [search, brandFilter]);

  /* ---------- SORT ---------- */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      if (sortField === 'brandName') {
        aVal = getBrandName(a.brandId);
        bVal = getBrandName(b.brandId);
      } else {
        aVal = a[sortField];
        bVal = b[sortField];
      }

      if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }, [filtered, sortField, sortDirection]);

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginated = sorted.slice(startIndex, endIndex);

  /* ---------- SORT HANDLER ---------- */
  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="p-8 space-y-6">
      <VehicleHeader total={vehicleModels.length} />

      <VehicleStats
        totalModels={vehicleModels.length}
        totalBrands={vehicleBrandIds.length}
        avgPrice={Math.round(
          vehicleModels.reduce((s, v) => s + v.pricePerDay, 0) /
            vehicleModels.length
        )}
      />

      <VehicleFilters
        search={search}
        brandFilter={brandFilter}
        brandIds={vehicleBrandIds}
        getBrandName={getBrandName}
        onSearchChange={setSearch}
        onBrandChange={setBrandFilter}
        onReset={() => {
          setSearch('');
          setBrandFilter('all');
        }}
        total={vehicleModels.length}
        filtered={filtered.length}
      />

      <VehicleTable
        vehicles={paginated}
        getBrandName={getBrandName}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        start={startIndex + 1}
        end={Math.min(endIndex, filtered.length)}
        total={filtered.length}
        onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        onGoTo={setCurrentPage}
      />
    </div>
  );
}
