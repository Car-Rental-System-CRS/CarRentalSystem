'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import BrandForm from './components/BrandForm';

export default function AddBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (payload: { name: string }) => {
    setLoading(true);

    console.log('CREATE BRAND:', payload);

    // TODO: POST /api/brands
    await new Promise((r) => setTimeout(r, 800));

    router.push('/staff/brand');
    router.refresh();
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Add New Brand</h1>
            <p className="text-gray-500 mt-1">Create a new vehicle brand</p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push('/staff/brand')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-semibold">Brand Details</h2>
          </div>

          <BrandForm
            onSubmit={handleCreate}
            loading={loading}
            submitText="Create Brand"
          />
        </div>
      </div>
    </div>
  );
}
