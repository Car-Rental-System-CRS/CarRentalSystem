'use client';

import { useState, useMemo, useEffect } from 'react';
import { brands } from '@/data/brands';

import BrandHeader from './components/BrandHeader';
import BrandStats from './components/BrandStats';
import BrandFilters from './components/BrandFilters';
import BrandTable from './components/BrandTable';
import Pagination from '@/components/Pagination';
import DeleteModal from '@/components/DeleteModal';

const ITEMS_PER_PAGE = 10;

type SortField = 'name';
type SortDirection = 'asc' | 'desc';

export default function BrandPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [confirm, setConfirm] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ---------- FILTER + SORT ---------- */
  const filtered = useMemo(() => {
    const result = brands.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase())
    );

    return result.sort((a, b) => {
      const value = a[sortField].localeCompare(b[sortField]);
      return sortDirection === 'asc' ? value : -value;
    });
  }, [search, sortField, sortDirection]);

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, endIndex);

  /* ---------- SORT HANDLER ---------- */
  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  /* ---------- DELETE HANDLER ---------- */
  const handleDelete = async () => {
    if (!confirm) return;

    setIsDeleting(true);
    try {
      console.log('DELETE BRAND ID:', confirm.id);
      await new Promise((r) => setTimeout(r, 800));
      // 👉 replace with API call later
    } finally {
      setIsDeleting(false);
      setConfirm(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <BrandHeader total={brands.length} />
      <BrandStats total={brands.length} />

      <BrandFilters
        search={search}
        onSearchChange={setSearch}
        onReset={() => setSearch('')}
        total={brands.length}
        filtered={filtered.length}
      />

      <BrandTable
        brands={paginated}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onDelete={(brand) => setConfirm({ id: brand.id, name: brand.name })}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        start={startIndex + 1}
        end={Math.min(endIndex, filtered.length)}
        total={filtered.length}
        onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        onGoTo={setCurrentPage}
      />

      <DeleteModal
        open={confirm !== null}
        title={
          confirm ? (
            <>
              Are you sure you want to delete{' '}
              <span className="text-red-600 font-semibold bg-red-50 px-1 rounded">
                “{confirm.name}”
              </span>
              ?
            </>
          ) : (
            'Are you sure you want to delete this item?'
          )
        }
        description="This action cannot be undone."
        onCancel={() => setConfirm(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
