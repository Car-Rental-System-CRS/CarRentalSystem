'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

type Props = {
  total: number;
  typeId: string;
  typeName?: string;
};

export default function CarHeader({ total, typeId, typeName }: Props) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href={`/staff/vehicle/${typeId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {typeName ?? 'Loading...'}
          </h1>
        </div>
      </div>

      <Button asChild className="bg-blue-600 hover:bg-blue-700">
        <Link href={`unit/add?typeId=${typeId}`}>
          <Plus className="w-4 h-4 mr-2" />
          Add Car
        </Link>
      </Button>
    </div>
  );
}
