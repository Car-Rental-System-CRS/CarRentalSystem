'use client';

import { Button } from '@/components/ui/Button';

type Unit = {
  license: string;
};

interface Props {
  unit?: Unit;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteUnitModal({ unit, onCancel, onConfirm }: Props) {
  if (!unit) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold text-red-600">Confirm Delete</h2>
        <p>
          Delete unit <b>{unit.license}</b>?
        </p>
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
