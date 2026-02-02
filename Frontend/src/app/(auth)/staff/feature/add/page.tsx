'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import FeatureForm from './components/FeatureForm';

export default function AddFeaturePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (payload: {
    name: string;
    description?: string;
  }) => {
    setLoading(true);

    console.log('CREATE FEATURE:', payload);

    // TODO: POST /api/features
    await new Promise((r) => setTimeout(r, 800));

    router.push('/staff/feature');
    router.refresh();
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Add New Feature</h1>
            <p className="text-gray-500 mt-1">
              Create a new feature for vehicle models
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.push('/staff/feature')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b bg-gray-50">
            <h2 className="text-xl font-semibold">Feature Details</h2>
          </div>

          <FeatureForm
            onSubmit={handleCreate}
            loading={loading}
            submitText="Create Feature"
          />
        </div>
      </div>
    </div>
  );
}
