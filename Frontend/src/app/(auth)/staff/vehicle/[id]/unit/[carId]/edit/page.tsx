'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import {
  handleError,
  handleSuccess,
  showLoading,
  dismissToast,
} from '@/lib/errorHandler';
import { carService } from '@/services/carService';
import { CarDamageImage } from '@/types/car';
import { ImageWithDescription } from '@/types/carType';

import EditHeader from './components/EditHeader';
import EditUnitForm from './components/EditUnitForm';
import OriginalValues from './components/OriginalValues';

type Unit = {
  id: string;
  licensePlate: string;
  importDate: string;
  damageImages?: CarDamageImage[];
};

export default function EditUnitPage() {
  const router = useRouter();
  const params = useParams<{
    id: string; // vehicleId
    carId: string; // unitId
  }>();

  const vehicleId = params.id;
  const typeId = vehicleId;
  const unitId = params.carId;

  const [unit, setUnit] = useState<Unit | null>(null);
  const [existingDamageImages, setExistingDamageImages] = useState<
    CarDamageImage[]
  >([]);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    license: '',
    importDate: '',
  });

  /* ---------- FETCH UNIT ---------- */
  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await carService.getById(unitId);
        const data = res.data.data;

        setUnit(data);
        setExistingDamageImages(data.damageImages || []);
        setForm({
          license: data.licensePlate,
          importDate: data.importDate,
        });
      } catch (err) {
        console.error('Fetch unit failed:', err);
        handleError(err, 'Failed to load vehicle unit');
        router.push(`/staff/vehicle/${vehicleId}/unit`);
      }
    };

    fetchUnit();
  }, [unitId, vehicleId, router]);

  /* ---------- UPDATE ---------- */
  const handleDeleteExistingDamageImage = async (imageId: string) => {
    try {
      setDeletingImageId(imageId);
      await carService.deleteDamageImage(unitId, imageId);
      setExistingDamageImages((prev) => prev.filter((img) => img.id !== imageId));
      handleSuccess('Damage image deleted');
    } catch (err) {
      handleError(err, 'Failed to delete damage image');
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    newDamageImages: ImageWithDescription[]
  ) => {
    e.preventDefault();

    let toastId: string | number | null = null;

    try {
      setLoading(true);
      toastId = showLoading('Updating vehicle unit...');

      console.log('UPDATE UNIT PAYLOAD', {
        unitId,
        licensePlate: form.license,
        importDate: form.importDate,
      });

      await carService.update(unitId, {
        licensePlate: form.license,
        importDate: form.importDate,
        typeId,
      });

      if (newDamageImages.length > 0) {
        try {
          const uploadResponse = await carService.uploadDamageImages(
            unitId,
            newDamageImages
          );
          setExistingDamageImages(uploadResponse.data.data);
        } catch (uploadError) {
          if (toastId) dismissToast(toastId);
          handleSuccess('Vehicle unit updated');
          handleError(
            uploadError,
            'Unit data was saved, but new damage image upload failed. Please retry.'
          );
          return;
        }
      }

      if (toastId) dismissToast(toastId);
      handleSuccess('Vehicle unit updated successfully');

      router.push(`/staff/vehicle/${vehicleId}/unit`);
      router.refresh();
    } catch (err) {
      console.error('Update unit failed:', err);
      if (toastId) dismissToast(toastId);
      handleError(err, 'Update vehicle unit failed');
    } finally {
      setLoading(false);
    }
  };

  if (!unit) return null;

  /* ---------- RENDER ---------- */
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <EditHeader vehicleId={vehicleId} />

        <EditUnitForm
          form={form}
          loading={loading}
          existingDamageImages={existingDamageImages}
          deletingImageId={deletingImageId}
          onChange={setForm}
          onDeleteExistingDamageImage={handleDeleteExistingDamageImage}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/staff/vehicle/${vehicleId}/unit`)}
        />

        <OriginalValues
          unit={{
            license: unit.licensePlate,
            importDate: unit.importDate,
          }}
        />
      </div>
    </div>
  );
}
