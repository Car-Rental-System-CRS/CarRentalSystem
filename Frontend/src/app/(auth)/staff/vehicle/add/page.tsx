'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import VehicleModelForm from './components/VehicleModelForm';

import { carBrandService } from '@/services/brandService';
import { carTypeService } from '@/services/carTypeService';

import { CarBrand } from '@/types/brand';
import { CreateCarTypePayload, ImageWithDescription } from '@/types/carType';

import {
  handleError,
  handleSuccess,
  showLoading,
  dismissToast,
} from '@/lib/errorHandler';

export default function AddVehicleModelPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [loading, setLoading] = useState(false);

  /* ---------- FETCH BRANDS ---------- */
  useEffect(() => {
    carBrandService.getAll({ page: 0, size: 1000 }).then((res) => {
      setBrands(res.data.data.items ?? []);
    });
  }, []);

  /* ---------- CREATE VEHICLE MODEL ---------- */
  const handleCreate = async (payload: CreateCarTypePayload, imagesWithDescriptions?: ImageWithDescription[]) => {
    let toastId: string | number | null = null;

    try {
      setLoading(true);

      toastId = showLoading('Creating vehicle model...');

      await carTypeService.create(payload, imagesWithDescriptions);

      if (toastId !== null) {
        dismissToast(toastId);
      }

      handleSuccess('Vehicle model created successfully');

      router.push('/staff/vehicle');
      router.refresh();
    } catch (err) {
      console.error(err);

      if (toastId !== null) {
        dismissToast(toastId);
      }

      handleError(err, 'Create vehicle model failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Add New Vehicle Model</h1>
            <p className="text-gray-500 mt-1">Create a new vehicle model</p>
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

        {/* Form */}
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-semibold">Model Details</h2>
          </div>

          <VehicleModelForm
            brands={brands}
            onSubmit={handleCreate}
            loading={loading}
            submitText="Create Vehicle Model"
          />
        </div>
      </div>
    </div>
  );
}
