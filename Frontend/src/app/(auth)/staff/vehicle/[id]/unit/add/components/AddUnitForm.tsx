'use client';

import React from 'react';
import { Car, Calendar, Navigation, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

export type AddUnitFormState = {
  license: string;
  importDate: string;
};

type Props = {
  form: AddUnitFormState;
  loading: boolean;
  onChange: React.Dispatch<React.SetStateAction<AddUnitFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export default function AddUnitForm({
  form,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-xl font-semibold text-gray-900">
          Unit Information
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the details for the new vehicle unit
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        {/* License Plate */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium flex items-center gap-2">
            <Car className="w-4 h-4" />
            License Plate *
          </Label>
          <Input
            value={form.license}
            onChange={(e) =>
              onChange((p) => ({
                ...p,
                license: e.target.value.toUpperCase(),
              }))
            }
            required
            placeholder="e.g., ABC-123, XYZ-789"
            className="text-base py-3 uppercase"
            maxLength={20}
          />
        </div>

        {/* Import Date */}
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Import Date *
          </Label>
          <Input
            type="date"
            value={form.importDate}
            onChange={(e) =>
              onChange((p) => ({ ...p, importDate: e.target.value }))
            }
            required
            className="py-3"
          />
        </div>
        {/* Actions */}
        <div className="pt-6 border-t">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="flex-1 gap-2 py-3 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating Unit...' : 'Create Vehicle Unit'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
