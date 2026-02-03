'use client';

import { use, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import { brands } from '@/data/brands';

import EditHeader from './components/EditHeader';
import EditBrandForm from './components/EditBrandForm';
import OriginalValues from './components/OriginalValues';

export default function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const brand = brands.find((b) => b.id === Number(id));
  if (!brand) return notFound();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: brand.name,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('UPDATE BRAND', {
      id: brand.id,
      ...form,
    });

    await new Promise((r) => setTimeout(r, 800));

    router.push('/staff/brand');
    router.refresh();
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
