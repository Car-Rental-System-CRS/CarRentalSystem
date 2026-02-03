'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import EditHeader from './components/EditHeader';
import EditBrandForm from './components/EditBrandForm';
import OriginalValues from './components/OriginalValues';

import { CarBrand } from '@/types/brand';
import { carBrandService } from '@/services/brandService';

import {
  handleError,
  handleSuccess,
  showLoading,
  dismissToast,
} from '@/lib/errorHandler';

type FormState = {
  name: string;
};

export default function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [brand, setBrand] = useState<CarBrand | null>(null);
  const [form, setForm] = useState<FormState>({ name: '' });
  const [loading, setLoading] = useState(false);

  /* ---------- FETCH BRAND ---------- */
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const res = await carBrandService.getById(id);
        const data = res.data.data;

        setBrand(data);
        setForm({ name: data.name });
      } catch (err) {
        handleError(err, 'Failed to load brand');
        router.push('/404');
      }
    };

    fetchBrand();
  }, [id, router]);

  if (!brand) return null;

  /* ---------- UPDATE ---------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let toastId: string | number | null = null;

    try {
      setLoading(true);

      toastId = showLoading('Updating brand...');

      await carBrandService.update(id, { name: form.name });

      if (toastId !== null) {
        dismissToast(toastId);
      }

      handleSuccess(
        'Brand updated successfully',
        `"${form.name}" has been updated`
      );

      router.push('/staff/brand');
      router.refresh();
    } catch (err) {
      if (toastId !== null) {
        dismissToast(toastId);
      }

      handleError(err, 'Update brand failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <EditHeader />

        <EditBrandForm
          form={form}
          loading={loading}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/staff/brand')}
        />

        <OriginalValues brand={brand} />
      </div>
    </div>
  );
}
