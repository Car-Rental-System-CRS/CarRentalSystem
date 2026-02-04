'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import EditHeader from './components/EditHeader';
import EditFeatureForm from './components/EditFeatureForm';
import OriginalValues from './components/OriginalValues';

import { featureService } from '@/services/featureService';
import { CarFeature } from '@/types/feature';

import {
  handleError,
  handleSuccess,
  showLoading,
  dismissToast,
} from '@/lib/errorHandler';

export default function EditFeaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [feature, setFeature] = useState<CarFeature | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  /* ---------- FETCH FEATURE ---------- */
  useEffect(() => {
    const fetchFeature = async () => {
      try {
        const res = await featureService.getById(id);
        const data = res.data.data;

        setFeature(data);
        setForm({
          name: data.name,
          description: data.description ?? '',
        });
      } catch (err) {
        handleError(err, 'Failed to load feature');
        router.push('/404');
      }
    };

    fetchFeature();
  }, [id, router]);

  if (!feature) return null;

  /* ---------- UPDATE ---------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let toastId: string | number | null = null;

    try {
      setLoading(true);

      toastId = showLoading('Updating feature...');

      await featureService.update(id, form);

      if (toastId !== null) {
        dismissToast(toastId);
      }

      handleSuccess(
        'Feature updated successfully',
        `"${form.name}" has been updated`
      );

      router.push('/staff/feature');
      router.refresh();
    } catch (err) {
      if (toastId !== null) {
        dismissToast(toastId);
      }

      handleError(err, 'Update feature failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <EditHeader />

        <EditFeatureForm
          form={form}
          loading={loading}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/staff/feature')}
        />

        <OriginalValues feature={feature} />
      </div>
    </div>
  );
}
