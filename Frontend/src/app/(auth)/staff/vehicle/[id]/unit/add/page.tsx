'use client';

import React, { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

import AddUnitForm, { AddUnitFormState } from './components/AddUnitForm';

export default function AddUnitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<AddUnitFormState>({
    license: '',
    importDate: new Date().toISOString().split('T')[0]!,
    gpsId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      typeId: Number(id),
    };

    console.log('Create Car Unit:', payload);

    // TODO: POST /api/car-unit
    await new Promise((r) => setTimeout(r, 800));

    router.push(`/staff/vehicle/${id}/unit`);
    router.refresh();
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="outline" size="sm">
              <Link href={`/staff/vehicle/${id}/unit`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Units
              </Link>
            </Button>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Vehicle Unit
              </h1>
              <p className="text-gray-500 mt-1">
                Register a new vehicle unit to the fleet
              </p>
            </div>
          </div>
        </div>

        {/* Form Component */}
        <AddUnitForm
          form={form}
          loading={loading}
          onChange={setForm}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/staff/vehicle/${id}/unit`)}
        />
      </div>
    </div>
  );
}
