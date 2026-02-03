'use client';

import Link from 'next/link';
import {
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Feature } from '@/data/features';

type SortField = 'name';
type SortDirection = 'asc' | 'desc';

interface Props {
  features: Feature[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  onDelete: (feature: Feature) => void;
}

export default function FeatureTable({
  features,
  sortField,
  sortDirection,
  onSortChange,
  onDelete,
}: Props) {
  const icon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1" />;

    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <Th onClick={() => onSortChange('name')}>
              Feature Name {icon('name')}
            </Th>
            <Th>Description</Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {features.map((f) => (
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

      {features.length === 0 && (
        <div className="text-center py-12 text-gray-500">No features found</div>
      )}
    </div>
  );
}

function Th({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <th
      onClick={onClick}
      className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
    >
      {children}
    </th>
  );
}
