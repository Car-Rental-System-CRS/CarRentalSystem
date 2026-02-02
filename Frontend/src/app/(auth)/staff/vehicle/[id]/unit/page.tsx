// app/staff/vehicle/[id]/unit/page.tsx
'use client';

import { useState, useMemo, useEffect, use } from 'react';
import { notFound } from 'next/navigation';

import { vehicleModels } from '@/data/vehicles';

import VehicleUnitsHeader from './components/VehicleUnitsHeader';
import VehicleUnitsTable from './components/VehicleUnitsTable';
import Pagination from '@/components/Pagination';
import DeleteModal from '@/components/DeleteModal';

type SortField = 'license' | 'importDate';
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

export default function VehicleUnitsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const vehicle = vehicleModels.find((v) => v.id === Number(id));
  if (!vehicle) return notFound();
  /* ---------- STATE ---------- */
  const [sortField, setSortField] = useState<SortField>('license');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [confirm, setConfirm] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const units = vehicle.units || [];

  /* ---------- RESET PAGE ON SEARCH ---------- */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  /* ---------- FILTER ---------- */
  const filteredUnits = useMemo(() => {
    return units.filter(
      (u) =>
        u.license.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.importDate.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [units, searchTerm]);

  /* ---------- SORT ---------- */
  const sortedUnits = useMemo(() => {
    return [...filteredUnits].sort((a, b) => {
      const value = a[sortField].localeCompare(b[sortField]);
      return sortDirection === 'asc' ? value : -value;
    });
  }, [filteredUnits, sortField, sortDirection]);

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(sortedUnits.length / ITEMS_PER_PAGE) || 1;

  // clamp page after delete / filter
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUnits = sortedUnits.slice(startIndex, endIndex);

  /* ---------- ACTIONS ---------- */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (!confirm) return;

    console.log('DELETE UNIT:', confirm.id);
    // await fetch(`/api/units/${confirm.id}`, { method: 'DELETE' })

    setConfirm(null);
  };

  return (
    <div className="p-8 space-y-6">
      <VehicleUnitsHeader
        vehicle={vehicle}
        search={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <VehicleUnitsTable
        units={paginatedUnits}
        vehicleId={vehicle.id}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onDelete={(unitId) => {
          const unit = units.find((u) => u.carId === unitId);
          if (unit) {
            setConfirm({ id: unit.carId, name: unit.license });
          }
        }}
        startIndex={startIndex}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        start={startIndex + 1}
        end={Math.min(endIndex, sortedUnits.length)}
        total={sortedUnits.length}
        onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        onGoTo={setCurrentPage}
      />

      <DeleteModal
        open={confirm !== null}
        title={
          confirm ? (
            <>
              Are you sure you want to delete{' '}
              <span className="text-red-600 font-semibold bg-red-50 px-1 rounded">
                “{confirm.name}”
              </span>
              ?
            </>
          ) : (
            'Are you sure you want to delete this item?'
          )
        }
        description="This action cannot be undone."
        onCancel={() => setConfirm(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
