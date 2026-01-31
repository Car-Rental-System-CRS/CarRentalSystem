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
import { Brand } from '@/data/brands';

type SortField = 'name';
type SortDirection = 'asc' | 'desc';

interface Props {
  brands: Brand[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  onDelete: (brand: Brand) => void;
}

export default function BrandTable({
  brands,
  sortField,
  sortDirection,
  onSortChange,
  onDelete,
}: Props) {
  const icon = () => {
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 ml-1" />;
    }
    return <ChevronDown className="w-4 h-4 ml-1" />;
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <Th onClick={() => onSortChange('name')}>
              Brand Name
              {sortField === 'name' ? (
                icon()
              ) : (
                <ArrowUpDown className="w-3 h-3 ml-1" />
              )}
            </Th>
            <Th>Actions</Th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {brands.map((b) => (
            <tr key={b.id} className="hover:bg-gray-50">
              <td className="py-4 px-6 font-medium">{b.name}</td>

              <td className="py-4 px-6">
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/staff/brand/${b.id}/edit`}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Link>
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(b)}
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

      {brands.length === 0 && (
        <div className="text-center py-12 text-gray-500">No brands found</div>
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
