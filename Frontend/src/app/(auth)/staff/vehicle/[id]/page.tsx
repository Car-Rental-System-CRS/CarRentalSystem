'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';

import VehicleDetailHeader from './components/VehicleDetailHeader';
import VehicleStatCards from './components/VehicleStatCards';
import VehicleBrandCard from './components/VehicleBrandCard';
import VehicleImagesCard from './components/VehicleImagesCard';
import VehicleActionsCard from './components/VehicleActionsCard';
import DeleteModal from '@/components/DeleteModal';

import {
  handleError,
  handleSuccess,
  showLoading,
  dismissToast,
} from '@/lib/errorHandler';

import { carTypeService } from '@/services/carTypeService';
import { CarType } from '@/types/carType';

export default function VehicleDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  /* ---------- STATE ---------- */
  const [vehicle, setVehicle] = useState<CarType | null>(null);
  const [loading, setLoading] = useState(true);

  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  /* ---------- FETCH VEHICLE ---------- */
  useEffect(() => {
    if (!id) return;

    const fetchVehicle = async () => {
      try {
        setLoading(true);

        const res = await carTypeService.getById(id);

        /**
         * API response shape:
         * {
         *   success: boolean
         *   message: string
         *   data: CarType
         * }
         */
        setVehicle(res.data.data);
      } catch (error) {
        console.error(error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  /* ---------- LOADING / ERROR ---------- */
  if (loading) {
    return <div className="p-8 text-gray-500">Loading vehicle...</div>;
  }

  if (!vehicle) return notFound();

  /* ---------- DELETE ---------- */
  const handleDelete = async () => {
    if (!confirmDelete) return;

    const toastId = showLoading('Deleting vehicle model...');
    setIsDeleting(true);

    try {
      await carTypeService.delete(confirmDelete.id);

      handleSuccess(
        'Vehicle deleted',
        `"${confirmDelete.name}" has been deleted`
      );

      router.push('/staff/vehicle');
      router.refresh();
    } catch (error) {
      handleError(error, 'Failed to delete vehicle');
    } finally {
      dismissToast(toastId);
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="p-8 space-y-6">
      <VehicleDetailHeader vehicle={vehicle} />

      <VehicleStatCards vehicle={vehicle} />

      {/* Car Type Images Card */}
      <VehicleImagesCard
        mediaFiles={vehicle.mediaFiles}
        vehicleName={vehicle.name}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <VehicleBrandCard
            brandName={vehicle.carBrand.name}
            brandId={vehicle.carBrand.id}
          />
        </div>

        <VehicleActionsCard
          vehicleId={vehicle.id}
          onDelete={() =>
            setConfirmDelete({
              id: vehicle.id,
              name: vehicle.name,
            })
          }
        />
      </div>

      {/* ---------- DELETE MODAL (FEATURE STYLE) ---------- */}
      <DeleteModal
        open={!!confirmDelete}
        title="Delete vehicle model"
        description={`Are you sure you want to delete "${confirmDelete?.name}"?`}
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}
