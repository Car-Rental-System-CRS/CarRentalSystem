// app/staff/vehicle/[id]/unit/VehicleUnitsClient.tsx
'use client';

import { useState, useMemo } from 'react';
import VehicleUnitsHeader from './VehicleUnitsHeader';
import VehicleUnitsTable from './VehicleUnitsTable';
import VehicleUnitsPagination from './VehicleUnitsPagination';
import DeleteUnitModal from './DeleteUnitModal';

type Unit = {
  carId: number;
  license: string;
  importDate: string;
};

type Vehicle = {
  id: number;
  carName: string;
  units: Unit[];
};

type SortField = 'license' | 'importDate';
type SortDirection = 'asc' | 'desc';

interface Props {
  vehicle: Vehicle;
}

export default function VehicleUnitsClient({ vehicle }: Props) {
  const [sortField, setSortField] = useState<SortField>('license');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteCarId, setDeleteCarId] = useState<number | null>(null);

  const itemsPerPage = 10;
  const units = vehicle.units || [];

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
      const aValue = a[sortField];
      const bValue = b[sortField];
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [filteredUnits, sortField, sortDirection]);

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(sortedUnits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUnits = sortedUnits.slice(startIndex, endIndex);

  /* ---------- ACTIONS ---------- */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((p) => (p === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleDelete = (carId: number) => {
    console.log('Delete unit:', carId);
    // await fetch(`/api/units/${carId}`, { method: 'DELETE' })
    setDeleteCarId(null);
  };

  const selectedUnit = units.find((u) => u.carId === deleteCarId);

  return (
    <div className="p-8 space-y-6">
      <VehicleUnitsHeader vehicle={vehicle} />

      <VehicleUnitsTable
        units={paginatedUnits}
        vehicleId={vehicle.id}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onDelete={(id) => setDeleteCarId(id)}
        startIndex={startIndex}
      />

      <VehicleUnitsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        start={startIndex + 1}
        end={Math.min(endIndex, sortedUnits.length)}
        total={sortedUnits.length}
        onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      />

      <DeleteUnitModal
        unit={selectedUnit}
        onCancel={() => setDeleteCarId(null)}
        onConfirm={() => deleteCarId && handleDelete(deleteCarId)}
      />
    </div>
  );
}
