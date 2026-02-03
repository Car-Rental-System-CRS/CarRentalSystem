'use client';

import { useRouter } from 'next/navigation';
import { use, useState } from 'react';
import { notFound } from 'next/navigation';

import { vehicleModels } from '@/data/vehicles';
import { brands } from '@/data/brands';
import { features } from '@/data/features';

import VehicleDetailHeader from './components/VehicleDetailHeader';
import VehicleStatCards from './components/VehicleStatCards';
import VehicleBrandCard from './components/VehicleBrandCard';
import VehicleFeaturesCard from './components/VehicleFeaturesCard';
import VehicleActionsCard from './components/VehicleActionsCard';
import DeleteModal from '@/components/DeleteModal';

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const vehicle = vehicleModels.find((v) => v.id === Number(id));
  if (!vehicle) return notFound();

  const [confirmVehicle, setConfirmVehicle] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const brandName =
    brands.find((b) => b.id === vehicle.brandId)?.name || 'Unknown';

  const vehicleFeatures = features
    .filter((f) => vehicle.featureIds.includes(f.id))
    .map((f) => f.name);

  const handleDelete = async () => {
    if (!confirmVehicle) return;

    setIsDeleting(true);
    try {
      console.log('DELETE VEHICLE ID:', confirmVehicle.id);
      await new Promise((r) => setTimeout(r, 800));
      router.push('/staff/vehicle');
      router.refresh();
    } finally {
      setIsDeleting(false);
      setConfirmVehicle(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <VehicleDetailHeader vehicle={vehicle} />

      <VehicleStatCards vehicle={vehicle} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <VehicleBrandCard brandName={brandName} brandId={vehicle.brandId} />
          <VehicleFeaturesCard features={vehicleFeatures} />
        </div>

        <VehicleActionsCard
          vehicleId={vehicle.id}
          quantity={vehicle.quantity}
          onDelete={() =>
            setConfirmVehicle({ id: vehicle.id, name: vehicle.carName })
          }
        />
      </div>

      <DeleteModal
        open={confirmVehicle !== null}
        title={
          confirmVehicle ? (
            <>
              Are you sure you want to delete{' '}
              <span className="text-red-600 font-semibold">
                “{confirmVehicle.name}”
              </span>
              ?
            </>
          ) : (
            'Are you sure you want to delete this item?'
          )
        }
        description="This action cannot be undone."
        onCancel={() => setConfirmVehicle(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
