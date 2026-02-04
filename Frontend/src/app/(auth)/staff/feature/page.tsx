'use client';

import {
  handleError,
  handleSuccess,
  showLoading,
  dismissToast,
} from '@/lib/errorHandler';

import { useEffect, useState } from 'react';

import FeatureHeader from './components/FeatureHeader';
import FeatureStats from './components/FeatureStats';
import FeatureFilters from './components/FeatureFilters';
import FeatureTable from './components/FeatureTable';
import Pagination from '@/components/Pagination';
import DeleteModal from '@/components/DeleteModal';

import { featureService } from '@/services/featureService';
import { CarFeature } from '@/types/feature';

const ITEMS_PER_PAGE = 10;

export default function FeaturesPage() {
  /* ---------- DATA ---------- */
  const [features, setFeatures] = useState<CarFeature[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  /* ---------- UI STATE ---------- */
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [confirm, setConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  /* ---------- RESET PAGE WHEN SEARCH ---------- */
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ---------- FETCH FROM BACKEND ---------- */
  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const res = await featureService.getAll({
        name: search || undefined,
        page: currentPage - 1, // Spring Pageable = 0-based
        size: ITEMS_PER_PAGE,
      });

      const page = res.data.data;
      setFeatures(page.items);
      setTotal(page.totalItems);
      setTotalPages(page.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [search, currentPage]);

  /* ---------- DELETE ---------- */
  const handleDelete = async () => {
    if (!confirm) return;

    const toastId = showLoading('Deleting feature...');
    setIsDeleting(true);

    try {
      await featureService.delete(confirm.id);

      handleSuccess('Feature deleted', `"${confirm.name}" has been deleted`);

      await fetchFeatures();
    } catch (error) {
      handleError(error, 'Failed to delete feature');
    } finally {
      dismissToast(toastId);
      setIsDeleting(false);
      setConfirm(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <FeatureHeader total={total} />
      <FeatureStats total={total} />

      <FeatureFilters
        search={search}
        onSearchChange={setSearch}
        onReset={() => setSearch('')}
        total={total}
        filtered={features.length}
      />

      <FeatureTable
        features={features}
        loading={loading}
        onDelete={(f) => setConfirm({ id: f.id, name: f.name })}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        start={(currentPage - 1) * ITEMS_PER_PAGE + 1}
        end={Math.min(currentPage * ITEMS_PER_PAGE, total)}
        total={total}
        onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        onGoTo={setCurrentPage}
      />

      <DeleteModal
        open={!!confirm}
        title="Delete feature"
        description={`Are you sure you want to delete "${confirm?.name}"?`}
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
