'use client';

import { useState } from 'react';
import { Save, Car, Tag, Users, Fuel, DollarSign } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

import { brands } from '@/data/brands';
import { features } from '@/data/features';

export type VehicleModelFormValues = {
  carName: string;
  brandId: number;
  numberOfSeats: number;
  consumption: string;
  price: number;
  featureIds: number[];
};

type Props = {
  initialValues?: VehicleModelFormValues;
  onSubmit: (payload: VehicleModelFormValues) => Promise<void>;
  loading?: boolean;
  submitText?: string;
};

export default function VehicleModelForm({
  initialValues,
  onSubmit,
  loading = false,
  submitText = 'Save',
}: Props) {
  const [form, setForm] = useState<VehicleModelFormValues>({
    carName: initialValues?.carName || '',
    brandId: initialValues?.brandId || 0,
    numberOfSeats: initialValues?.numberOfSeats || 5,
    consumption: initialValues?.consumption || '',
    price: initialValues?.price || 0,
    featureIds: initialValues?.featureIds || [],
  });

  const handleChange = <K extends keyof VehicleModelFormValues>(
    field: K,
    value: VehicleModelFormValues[K]
  ) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const toggleFeature = (id: number) => {
    setForm((p) => ({
      ...p,
      featureIds: p.featureIds.includes(id)
        ? p.featureIds.filter((f) => f !== id)
        : [...p.featureIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Model Name */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Car className="w-4 h-4" /> Model Name *
        </Label>
        <Input
          value={form.carName}
          onChange={(e) => handleChange('carName', e.target.value)}
          required
          className="py-3"
        />
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tag className="w-4 h-4" /> Brand *
        </Label>
        <select
          className="w-full border rounded-lg px-4 py-3 text-sm"
          value={form.brandId || ''}
          onChange={(e) => handleChange('brandId', Number(e.target.value))}
          required
        >
          <option value="">Select brand</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Seats
          </Label>
          <Input
            type="number"
            min={1}
            value={form.numberOfSeats}
            onChange={(e) =>
              handleChange('numberOfSeats', Number(e.target.value))
            }
            className="py-3"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Fuel className="w-4 h-4" /> Consumption
          </Label>
          <Input
            value={form.consumption}
            onChange={(e) => handleChange('consumption', e.target.value)}
            className="py-3"
          />
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Price per Day *
        </Label>
        <Input
          type="number"
          min={0}
          value={form.price}
          onChange={(e) => handleChange('price', Number(e.target.value))}
          required
          className="py-3"
        />
      </div>

      {/* Features */}
      <div className="space-y-2">
        <Label>Features</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => toggleFeature(f.id)}
              className={`border rounded-lg px-3 py-2 text-sm ${
                form.featureIds.includes(f.id)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
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
