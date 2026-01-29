'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import VehicleModelForm, {
  VehicleModelFormValues,
} from '../../add/components/VehicleModelForm';
import VehicleOriginalValues from './components/VehicleOriginalValues';

import { vehicleModels } from '@/data/vehicles';

export default function EditVehicleModelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const vehicle = vehicleModels.find((v) => v.id === Number(id));

  if (!vehicle) {
    return (
      <div className="p-8 text-center">
        <p className="mb-4">Vehicle not found</p>
        <Button onClick={() => router.push('/staff/vehicle')}>Back</Button>
      </div>
    );
  }

  const initialValues: VehicleModelFormValues = {
    carName: vehicle.carName,
    brandId: vehicle.brandId,
    numberOfSeats: vehicle.numberOfSeats,
    consumption: vehicle.consumption,
    price: vehicle.pricePerDay,
    featureIds: vehicle.featureIds,
  };

  const handleUpdate = async (data: VehicleModelFormValues) => {
    setLoading(true);

    const payload = {
      typeId: Number(id),
      ...data,
    };

    console.log('UPDATE VEHICLE MODEL:', payload);

    // TODO: PUT /api/vehicle-models/{id}
    await new Promise((r) => setTimeout(r, 800));

    router.push(`/staff/vehicle/${id}`);
    router.refresh();
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Edit Vehicle Model</h1>
            <p className="text-gray-500 mt-1">{vehicle.carName}</p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-semibold">Model Details</h2>
          </div>

          <VehicleModelForm
            initialValues={initialValues}
            onSubmit={handleUpdate}
            loading={loading}
            submitText="Save Changes"
          />
        </div>
        <VehicleOriginalValues vehicle={vehicle} />
      </div>
    </div>
  );
}
