'use client';

import { Tag, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

type FormState = {
  name: string;
};

interface Props {
  form: FormState;
  loading: boolean;
  onChange: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function EditBrandForm({
  form,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-xl font-semibold">Brand Information</h2>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <Field label="Brand Name" icon={<Tag />}>
          <Input
            value={form.name}
            onChange={(e) => onChange((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </Field>

        <div className="pt-6 border-t flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}
