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

import EditHeader from './components/EditHeader';
import EditUnitForm from './components/EditUnitForm';
import OriginalValues from './components/OriginalValues';

type Unit = {
  id: string;
  licensePlate: string;
  importDate: string;
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
  const handleSubmit = async (e: React.FormEvent) => {
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
          onChange={setForm}
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
