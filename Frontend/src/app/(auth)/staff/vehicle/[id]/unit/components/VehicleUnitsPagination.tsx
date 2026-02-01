'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  currentPage: number;
  totalPages: number;
  start: number;
  end: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function VehicleUnitsPagination({
  currentPage,
  totalPages,
  start,
  end,
  total,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="border-t px-6 py-4 bg-gray-50 flex justify-between">
      <span className="text-sm text-gray-600">
        Showing {start}–{end} of {total}
      </span>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onPrev}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onNext}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
