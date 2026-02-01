'use client';

import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

import { vehicleModels } from '@/data/vehicles';
import { brands } from '@/data/brands';
import { features } from '@/data/features';
import { notFound } from 'next/navigation';

import VehicleDetailHeader from './components/VehicleDetailHeader';
import VehicleStatCards from './components/VehicleStatCards';
import VehicleBrandCard from './components/VehicleBrandCard';
import VehicleFeaturesCard from './components/VehicleFeaturesCard';
import VehicleActionsCard from './components/VehicleActionsCard';
import DeleteVehicleModal from './components/DeleteVehicleModal';

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const vehicle = vehicleModels.find((v) => v.id === Number(id));
  if (!vehicle) return notFound();

  const brandName =
    brands.find((b) => b.id === vehicle.brandId)?.name || 'Unknown';

  const vehicleFeatures = features
    .filter((f) => vehicle.featureIds.includes(f.id))
    .map((f) => f.name);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log('DELETE MODEL ID:', vehicle.id);
      await new Promise((r) => setTimeout(r, 800));
      router.push('/staff/vehicle');
      router.refresh();
    } finally {
      setIsDeleting(false);
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
          onDelete={() => setShowDelete(true)}
        />
      </div>

      <DeleteVehicleModal
        open={showDelete}
        vehicleName={vehicle.carName}
        isDeleting={isDeleting}
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
