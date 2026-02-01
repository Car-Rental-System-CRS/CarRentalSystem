'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { vehicleModels } from '@/data/vehicles';
import { notFound } from 'next/navigation';

import EditHeader from './components/EditHeader';
import EditUnitForm from './components/EditUnitForm';
import OriginalValues from './components/OriginalValues';

export default function EditUnitPage({
  params,
}: {
  params: Promise<{ id: string; carId: string }>;
}) {
  const { id, carId } = use(params);
  const router = useRouter();

  const vehicle = vehicleModels.find((v) => v.id === Number(id));
  if (!vehicle) return notFound();

  const unit = vehicle.units.find((u) => u.carId === Number(carId));
  if (!unit) return notFound();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    license: unit.license,
    importDate: unit.importDate,
    gpsId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('UPDATE UNIT', {
      carId: unit.carId,
      modelId: vehicle.id,
      ...form,
    });

    await new Promise((r) => setTimeout(r, 800));

    router.push(`/staff/vehicle/${vehicle.id}/unit`);
    router.refresh();
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <EditHeader vehicleId={vehicle.id.toString()} />

        <EditUnitForm
          // unit={unit}
          form={form}
          loading={loading}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/staff/vehicle/${vehicle.id}/unit`)}
        />

        <OriginalValues unit={unit} />
      </div>
    </div>
  );
}
