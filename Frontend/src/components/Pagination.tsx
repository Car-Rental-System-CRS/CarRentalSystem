import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VehiclePagination({
  currentPage,
  totalPages,
  start,
  end,
  total,
  onPrev,
  onNext,
}: any) {
  if (totalPages <= 1) return null;

  return (
    <div className="border-t px-6 py-4 bg-gray-50 flex justify-between items-center">
      <div className="text-sm text-gray-600">
        Showing{' '}
        <b>
          {start}-{end}
        </b>{' '}
        of <b>{total}</b>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onPrev}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>

        <span className="text-sm font-medium">
          Page {currentPage} / {totalPages}
        </span>

        <Button
          size="sm"
          variant="outline"
          onClick={onNext}
          disabled={currentPage === totalPages}
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
