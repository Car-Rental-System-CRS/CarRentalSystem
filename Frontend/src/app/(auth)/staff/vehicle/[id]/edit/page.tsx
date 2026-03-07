'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import VehicleModelForm from './components/EditVehicleForm';
import VehicleOriginalValues from './components/VehicleOriginalValues';

import { carBrandService } from '@/services/brandService';
import { carTypeService } from '@/services/carTypeService';

import { CarBrand } from '@/types/brand';
import { CreateCarTypePayload, CarType, ImageWithDescription } from '@/types/carType';

import {
  handleError,
  handleSuccess,
  showLoading,
  dismissToast,
} from '@/lib/errorHandler';

export default function EditVehicleModelPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [vehicle, setVehicle] = useState<CarType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ---------- FETCH DATA ---------- */
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [brandRes, vehicleRes] = await Promise.all([
          carBrandService.getAll({ page: 0, size: 1000 }),
          carTypeService.getById(id),
        ]);

        setBrands(brandRes.data.data.items ?? []);
        setVehicle(vehicleRes.data.data);
      } catch (err) {
        console.error(err);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ---------- LOADING ---------- */
  if (loading) {
    return <div className="p-8 text-gray-500">Loading vehicle model...</div>;
  }

  if (!vehicle) return notFound();

  /* ---------- INITIAL VALUES ---------- */
  const initialValues: CreateCarTypePayload = {
    name: vehicle.name,
    brandId: vehicle.carBrand.id,
    numberOfSeats: vehicle.numberOfSeats,
    consumptionKwhPerKm: vehicle.consumptionKwhPerKm,
    price: vehicle.price,
  };

  /* ---------- UPDATE ---------- */
  const handleUpdate = async (payload: CreateCarTypePayload, imagesWithDescriptions?: ImageWithDescription[]) => {
    let toastId: string | number | null = null;

    try {
      setSaving(true);
      toastId = showLoading('Updating vehicle model...');

      await carTypeService.update(id, payload, imagesWithDescriptions);

      if (toastId !== null) dismissToast(toastId);

      handleSuccess('Vehicle model updated successfully');

      router.push(`/staff/vehicle/${id}`);
      router.refresh();
    } catch (err) {
      if (toastId !== null) dismissToast(toastId);
      handleError(err, 'Update vehicle failed');
    } finally {
      setSaving(false);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Edit Vehicle Model</h1>
            <p className="text-gray-500 mt-1">{vehicle.name}</p>
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
            initialValues={initialValues}
            onSubmit={handleUpdate}
            loading={saving}
            submitText="Save Changes"
          />
        </div>

        {/* Original values */}
        <VehicleOriginalValues vehicle={vehicle} />
      </div>
    </div>
  );
}
