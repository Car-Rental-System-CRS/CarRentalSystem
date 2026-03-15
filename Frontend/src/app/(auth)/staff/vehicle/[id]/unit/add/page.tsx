'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import AddUnitForm, { AddUnitFormState } from './components/AddUnitForm';
import { carService } from '@/services/carService';
import { ImageWithDescription } from '@/types/carType';

import {
  handleError,
  handleSuccess,
  showLoading,
  dismissToast,
} from '@/lib/errorHandler';

export default function AddUnitPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const typeId = params.id;

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<AddUnitFormState>({
    license: '',
    importDate: new Date().toISOString().split('T')[0]!,
  });

  /* ---------- CREATE ---------- */
  const handleCreate = async (
    e: React.FormEvent,
    damageImages: ImageWithDescription[]
  ) => {
    e.preventDefault();

    let toastId: string | number | null = null;

    try {
      setLoading(true);
      toastId = showLoading('Creating vehicle unit...');

      const createResponse = await carService.create({
        licensePlate: form.license,
        importDate: form.importDate,
        typeId,
      });

      const createdCarId = createResponse.data.data.id;

      if (damageImages.length > 0) {
        try {
          await carService.uploadDamageImages(createdCarId, damageImages);
        } catch (uploadError) {
          if (toastId) dismissToast(toastId);
          handleSuccess('Vehicle unit created with warning');
          handleError(
            uploadError,
            'Vehicle unit was created, but damage image upload failed. Please retry from edit page.'
          );
          router.push(`/staff/vehicle/${typeId}/unit/${createdCarId}/edit`);
          return;
        }
      }

      if (toastId) dismissToast(toastId);
      handleSuccess('Vehicle unit created successfully');

      router.push(`/staff/vehicle/${typeId}/unit`);
    } catch (err) {
      console.error('API error:', err);
      if (toastId) dismissToast(toastId);
      handleError(err, 'Create vehicle unit failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Add New Vehicle Unit</h1>
            <p className="text-gray-500 mt-1">
              Register a new vehicle unit to the fleet
            </p>
          </div>

          <Button variant="outline" asChild className="gap-2">
            <Link href={`/staff/vehicle/${typeId}/unit`}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-semibold">Unit Details</h2>
          </div>

          <AddUnitForm
            form={form}
            loading={loading}
            onChange={setForm}
            onSubmit={handleCreate}
            onCancel={() => router.push(`/staff/vehicle/${typeId}/unit`)}
          />
        </div>
      </div>
    </div>
  );
}
