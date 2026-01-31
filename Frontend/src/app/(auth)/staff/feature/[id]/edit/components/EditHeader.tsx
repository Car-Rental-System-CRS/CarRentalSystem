import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function EditHeader() {
  return (
    <div className="flex items-center gap-4">
      <Button asChild variant="outline" size="sm">
        <Link href="/staff/feature">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Features
        </Link>
      </Button>

      <h1 className="text-3xl font-bold">Edit Feature</h1>
    </div>
  );
}
