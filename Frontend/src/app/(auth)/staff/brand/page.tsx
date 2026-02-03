'use client';
import {
  handleError,
  handleSuccess,
  showLoading,
  dismissToast,
} from '@/lib/errorHandler';

import { useState, useEffect } from 'react';

import BrandHeader from './components/BrandHeader';
import BrandStats from './components/BrandStats';
import BrandFilters from './components/BrandFilters';
import BrandTable from './components/BrandTable';
import Pagination from '@/components/Pagination';
import DeleteModal from '@/components/DeleteModal';

import { carBrandService } from '@/services/brandService';
import { CarBrand } from '@/types/brand';

const ITEMS_PER_PAGE = 10;

type SortField = 'name';
type SortDirection = 'asc' | 'desc';

export default function BrandPage() {
  /* ---------- DATA ---------- */
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  /* ---------- UI STATE ---------- */
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [confirm, setConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  /* ---------- RESET PAGE WHEN SEARCH ---------- */
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ---------- FETCH DATA FROM BACKEND ---------- */
  useEffect(() => {
    const fetchBrands = async () => {
      setLoading(true);
      try {
        const res = await carBrandService.getAll({
          name: search || undefined,
          page: currentPage - 1, // Spring Pageable = 0-based
          size: ITEMS_PER_PAGE,
        });

        const page = res.data.data;

        setBrands(page.items);
        setTotal(page.totalItems);
        setTotalPages(page.totalPages);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [search, currentPage]);

  /* ---------- SORT ---------- */
  const handleSortChange = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }

    setBrands((prev) =>
      [...prev].sort((a, b) => {
        const value = a[field].localeCompare(b[field]);
        return sortDirection === 'asc' ? value : -value;
      })
    );
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async () => {
    if (!confirm) return;

    const toastId = showLoading('Deleting brand...');
    setIsDeleting(true);

    try {
      await carBrandService.delete(confirm.id);

      handleSuccess('Brand deleted', `"${confirm.name}" has been deleted`);

      // Reload data
      const res = await carBrandService.getAll({
        name: search || undefined,
        page: currentPage - 1,
        size: ITEMS_PER_PAGE,
      });

      const page = res.data.data;
      setBrands(page.items);
      setTotal(page.totalItems);
      setTotalPages(page.totalPages);
    } catch (error) {
      handleError(error, 'Failed to delete brand');
    } finally {
      dismissToast(toastId);
      setIsDeleting(false);
      setConfirm(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <BrandHeader total={total} />
      <BrandStats total={total} />

      <BrandFilters
        search={search}
        onSearchChange={setSearch}
        onReset={() => setSearch('')}
        total={total}
        filtered={brands.length}
      />

      <BrandTable
        brands={brands}
        loading={loading}
        sortField={sortField}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onDelete={(brand) => setConfirm({ id: brand.id, name: brand.name })}
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
        title="Delete brand"
        description={`Are you sure you want to delete "${confirm?.name}"?`}
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setConfirm(null)}
      />
    </div>
  );
}
