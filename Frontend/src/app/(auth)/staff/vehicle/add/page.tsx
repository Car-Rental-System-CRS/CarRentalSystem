'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import VehicleModelForm from './components/VehicleModelForm';

export default function AddVehicleModelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (payload: any) => {
    setLoading(true);

    console.log('CREATE VEHICLE MODEL:', payload);

    // TODO: POST /api/vehicle-models
    await new Promise((r) => setTimeout(r, 800));

    router.push('/staff/vehicle');
    router.refresh();
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Add New Vehicle Model</h1>
            <p className="text-gray-500 mt-1">
              Create a new vehicle model to add to your fleet
            </p>
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
            onSubmit={handleCreate}
            loading={loading}
            submitText="Create Vehicle Model"
          />
        </div>
      </div>
    </div>
  );
}
