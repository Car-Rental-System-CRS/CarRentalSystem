'use client';

import { useState, useMemo, useEffect } from 'react';
import { features } from '@/data/features';

import FeatureHeader from './components/FeatureHeader';
import FeatureStats from './components/FeatureStats';
import FeatureFilters from './components/FeatureFilters';
import FeatureTable from './components/FeatureTable';
import Pagination from '@/components/Pagination';
import DeleteModal from '@/components/DeleteModal';

const ITEMS_PER_PAGE = 10;

type SortField = 'name';
type SortDirection = 'asc' | 'desc';

export default function FeaturesPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [confirmFeature, setConfirmFeature] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ---------- FILTER ---------- */
  const filtered = useMemo(() => {
    return features.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  /* ---------- SORT ---------- */
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (sortDirection === 'asc') return aVal.localeCompare(bVal);
      return bVal.localeCompare(aVal);
    });
  }, [filtered, sortField, sortDirection]);

  /* ---------- PAGINATION ---------- */
  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginated = sorted.slice(startIndex, endIndex);

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
    if (!confirmFeature) return;

    setIsDeleting(true);
    try {
      console.log('DELETE FEATURE ID:', confirmFeature.id);
      await new Promise((r) => setTimeout(r, 800));
      // 👉 API call later
    } finally {
      setIsDeleting(false);
      setConfirmFeature(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <FeatureHeader total={features.length} />

      <FeatureStats total={features.length} />

      <FeatureFilters
        search={search}
        onSearchChange={setSearch}
        onReset={() => setSearch('')}
        total={features.length}
        filtered={filtered.length}
      />

      <FeatureTable
        features={paginated}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onDelete={(feature) =>
          setConfirmFeature({ id: feature.id, name: feature.name })
        }
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
        open={confirmFeature !== null}
        title={
          confirmFeature ? (
            <>
              Are you sure you want to delete{' '}
              <span className="text-red-600 font-semibold">
                “{confirmFeature.name}”
              </span>
              ?
            </>
          ) : (
            'Are you sure you want to delete this item?'
          )
        }
        description="This action cannot be undone."
        onCancel={() => setConfirmFeature(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
