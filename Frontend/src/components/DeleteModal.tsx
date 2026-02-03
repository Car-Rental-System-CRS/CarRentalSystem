'use client';

import { Button } from '@/components/ui/Button';

interface DeleteModalProps {
  open: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteModal({
  open,
  title = 'Delete item?',
  description = 'This action cannot be undone.',
  loading = false,
  onConfirm,
  onClose,
}: DeleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[380px] space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>

        <p className="text-sm text-gray-600">{description}</p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>

          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}
