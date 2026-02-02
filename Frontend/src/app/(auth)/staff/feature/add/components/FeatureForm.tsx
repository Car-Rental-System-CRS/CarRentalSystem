'use client';

import { useState } from 'react';
import { Save, Tag, FileText } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export type FeatureFormValues = {
  name: string;
  description?: string;
};

type Props = {
  initialValues?: FeatureFormValues;
  onSubmit: (payload: FeatureFormValues) => Promise<void>;
  loading?: boolean;
  submitText?: string;
};

export default function FeatureForm({
  initialValues,
  onSubmit,
  loading = false,
  submitText = 'Save',
}: Props) {
  const [form, setForm] = useState<FeatureFormValues>({
    name: initialValues?.name || '',
    description: initialValues?.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Feature Name *
        </Label>
        <Input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          required
          className="py-3"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Description
        </Label>
        <Input
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
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
