'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { features } from '@/data/features';
import { notFound } from 'next/navigation';

import EditHeader from './components/EditHeader';
import EditFeatureForm from './components/EditFeatureForm';
import OriginalValues from './components/OriginalValues';

export default function EditFeaturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const feature = features.find((f) => f.id === Number(id));
  if (!feature) return notFound();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: feature.name,
    description: feature.description ?? '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('UPDATE FEATURE', {
      id: feature.id,
      ...form,
    });

    await new Promise((r) => setTimeout(r, 800));

    router.push('/staff/feature');
    router.refresh();
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
