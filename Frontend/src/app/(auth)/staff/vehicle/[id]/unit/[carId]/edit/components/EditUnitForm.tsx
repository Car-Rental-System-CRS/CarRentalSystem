import { Car, Calendar, Navigation, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

type FormState = {
  license: string;
  importDate: string;
  gpsId: string;
};

interface Props {
  form: FormState;
  loading: boolean;
  onChange: React.Dispatch<React.SetStateAction<FormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function EditUnitForm({
  form,
  loading,
  onChange,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="p-6 border-b bg-gray-50">
        <h2 className="text-xl font-semibold">Edit Unit Information</h2>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <Field label="License Plate" icon={<Car />}>
          <Input
            value={form.license}
            onChange={(e) =>
              onChange((p) => ({ ...p, license: e.target.value.toUpperCase() }))
            }
            required
          />
        </Field>

        <Field label="Import Date" icon={<Calendar />}>
          <Input
            type="date"
            value={form.importDate}
            onChange={(e) =>
              onChange((p) => ({ ...p, importDate: e.target.value }))
            }
            required
          />
        </Field>

        <Field label="GPS Device ID" icon={<Navigation />}>
          <Input
            value={form.gpsId}
            onChange={(e) => onChange((p) => ({ ...p, gpsId: e.target.value }))}
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
