'use client';

import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CarFeature } from '@/types/feature';

interface Props {
  features: CarFeature[];
  loading?: boolean;
  onDelete: (feature: CarFeature) => void;
}

export default function FeatureTable({ features, loading, onDelete }: Props) {
  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <Th>Feature Name</Th>
            <Th>Description</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {loading && (
            <tr>
              <td colSpan={3} className="py-8 text-center text-gray-500">
                Loading...
              </td>
            </tr>
          )}

          {!loading &&
            features.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 font-medium">{f.name}</td>
                <td className="py-4 px-6 text-gray-600">
                  {f.description || '—'}
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/staff/feature/${f.id}/edit`}>
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Link>
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(f)}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {!loading && features.length === 0 && (
        <div className="text-center py-12 text-gray-500">No features found</div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase">
      {children}
    </th>
  );
}
