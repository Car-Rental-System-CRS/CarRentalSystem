'use client';

import { useEffect, useState } from 'react';

import {
  handleError,
  handleSuccess,
  showLoading,
  dismissToast,
} from '@/lib/errorHandler';

import Pagination from '@/components/Pagination';
import DeleteModal from '@/components/DeleteModal';

import CarHeader from './components/VehicleUnitsHeader';
import CarFilters from './components/VehicleFilters';
import CarTable from './components/VehicleUnitsTable';
import CarStats from './components/VehicleStats';

import { carService } from '@/services/carService';
import { Car } from '@/types/car';

const ITEMS_PER_PAGE = 10;

export default function CarsPage() {
  /* ---------- DATA ---------- */
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  /* ---------- FILTERS (MATCH BE) ---------- */
  const [licensePlate, setLicensePlate] = useState('');
  const [importFrom, setImportFrom] = useState<string | undefined>();
  const [importTo, setImportTo] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------- DELETE ---------- */
  const [confirm, setConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  /* ---------- RESET PAGE WHEN FILTER CHANGES ---------- */
  useEffect(() => {
    setCurrentPage(1);
  }, [licensePlate, importFrom, importTo]);

  /* ---------- FETCH FROM BE ---------- */
  const fetchCars = async () => {
    setLoading(true);
    try {
      const res = await carService.getAll({
        licensePlate: licensePlate || undefined,
        importFrom,
        importTo,
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
      });
      console.log('RAW RESPONSE:', res.data);
      const page = res.data.data;

      setCars(page.items);
      setTotal(page.totalItems);
      setTotalPages(page.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [licensePlate, importFrom, importTo, currentPage]);

  /* ---------- DELETE ---------- */
  const handleDelete = async () => {
    if (!confirm) return;

    const toastId = showLoading('Deleting car...');
    setIsDeleting(true);

    try {
      await carService.delete(confirm.id);

      handleSuccess('Car deleted', `"${confirm.name}" has been deleted`);
      await fetchCars();
    } catch (error) {
      handleError(error, 'Failed to delete car');
    } finally {
      dismissToast(toastId);
      setIsDeleting(false);
      setConfirm(null);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="p-8 space-y-6">
      <CarHeader total={total} />
      <CarStats total={total} />

      <CarFilters
        licensePlate={licensePlate}
        importFrom={importFrom}
        importTo={importTo}
        onLicensePlateChange={setLicensePlate}
        onImportFromChange={setImportFrom}
        onImportToChange={setImportTo}
        onReset={() => {
          setLicensePlate('');
          setImportFrom(undefined);
          setImportTo(undefined);
        }}
        total={total}
        filtered={cars.length}
      />

      <CarTable
        cars={cars}
        loading={loading}
        onDelete={(c) =>
          setConfirm({
            id: c.id,
            name: c.licensePlate,
          })
        }
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        start={(currentPage - 1) * ITEMS_PER_PAGE + 1}
        end={Math.min(currentPage * ITEMS_PER_PAGE, total)}
        total={total}
        onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        onGoTo={setCurrentPage}
      />

      <DeleteModal
        open={!!confirm}
        title="Delete car"
        description={`Are you sure you want to delete "${confirm?.name}"?`}
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
