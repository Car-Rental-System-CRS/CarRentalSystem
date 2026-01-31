import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function BrandHeader({ total }: { total: number }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Brands</h1>
        <p className="text-gray-500 mt-1">Manage vehicle brands ({total})</p>
      </div>

      <Button asChild className="gap-2">
        <Link href="/staff/brand/add">
          <Plus className="w-4 h-4" />
          Add Brand
        </Link>
      </Button>
    </div>
  );
}
