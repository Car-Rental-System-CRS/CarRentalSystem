'use client';

import { useState } from 'react';
import { Save, Tag } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export type BrandFormValues = {
  name: string;
};

type Props = {
  initialValues?: BrandFormValues;
  onSubmit: (payload: BrandFormValues) => Promise<void>;
  loading?: boolean;
  submitText?: string;
};

export default function BrandForm({
  initialValues,
  onSubmit,
  loading = false,
  submitText = 'Save',
}: Props) {
  const [name, setName] = useState(initialValues?.name || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Brand Name */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Brand Name *
        </Label>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Toyota"
          className="py-3"
        />
      </div>

      {/* Submit */}
      <div className="pt-6 border-t">
        <Button type="submit" disabled={loading} className="w-full gap-2 py-3">
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}
