import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DeleteVehicleModal({
  open,
  vehicleName,
  isDeleting,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  vehicleName: string;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Delete Vehicle Model</h2>
            <p className="text-sm text-gray-600">
              This action cannot be undone
            </p>
          </div>
        </div>

        <p className="text-sm">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-red-700">{vehicleName}</span>?
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
