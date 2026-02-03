'use client';

import { useEffect, useRef, useState } from 'react';
import { Save, Car, Tag, Users, Fuel, DollarSign } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

import { CarBrand } from '@/types/brand';
import { CreateCarTypePayload } from '@/types/carType';

type Props = {
  brands: CarBrand[];
  initialValues?: CreateCarTypePayload;
  onSubmit: (payload: CreateCarTypePayload) => Promise<void>;
  loading?: boolean;
  submitText?: string;
};

export default function VehicleModelForm({
  brands,
  initialValues,
  onSubmit,
  loading = false,
  submitText = 'Save',
}: Props) {
  const [form, setForm] = useState<CreateCarTypePayload>({
    name: '',
    brandId: '',
    numberOfSeats: 5,
    consumptionKwhPerKm: 0,
    price: 0,
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initialValues && !initializedRef.current) {
      setForm(initialValues);
      initializedRef.current = true;
    }
  }, [initialValues]);

  const handleChange = <K extends keyof CreateCarTypePayload>(
    field: K,
    value: CreateCarTypePayload[K]
  ) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('FORM SUBMIT PAYLOAD', form);
    console.log('brandId value:', form.brandId);
    console.log('brandId type:', typeof form.brandId);
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Car className="w-4 h-4" /> Model Name *
        </Label>
        <Input
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Tag className="w-4 h-4" /> Brand *
        </Label>
        <select
          className="w-full border rounded-lg px-4 py-3 text-sm"
          value={form.brandId}
          onChange={(e) => handleChange('brandId', e.target.value)}
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
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Fuel className="w-4 h-4" /> Consumption (kWh/km)
          </Label>
          <Input
            type="number"
            step="0.01"
            min={0}
            value={form.consumptionKwhPerKm}
            onChange={(e) =>
              handleChange('consumptionKwhPerKm', Number(e.target.value))
            }
          />
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" /> Price *
        </Label>
        <Input
          type="number"
          min={0}
          value={form.price}
          onChange={(e) => handleChange('price', Number(e.target.value))}
          required
        />
      </div>

      {/* Submit */}
      <div className="pt-6 border-t">
        <Button type="submit" disabled={loading} className="w-full gap-2">
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : submitText}
        </Button>
      </div>
    </form>
  );
}
