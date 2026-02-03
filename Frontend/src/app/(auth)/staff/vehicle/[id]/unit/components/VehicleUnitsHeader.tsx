'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type Props = {
  total: number;
};

export default function CarHeader({ total }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">Cars</h1>
        <p className="text-gray-500">Manage all cars in the system ({total})</p>
      </div>

      <Button asChild className="bg-blue-600 hover:bg-blue-700">
        <Link href={`unit/add`}>
          <Plus className="w-4 h-4 mr-2" />
          Add Car
        </Link>
      </Button>
    </div>
  );
}
