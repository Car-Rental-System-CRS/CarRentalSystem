'use client';

import { useState, useEffect, useCallback } from 'react';
import { handleError } from '@/lib/errorHandler';

import BookingHeader from './components/BookingHeader';
import BookingStats from './components/BookingStats';
import BookingFilters from './components/BookingFilters';
import BookingTable from './components/BookingTable';
import BookingDetailDialog from './components/BookingDetailDialog';
import Pagination from '@/components/Pagination';

import {
  staffBookingService,
  AdminBookingResponse,
} from '@/services/staffBookingService';

const ITEMS_PER_PAGE = 10;

export default function StaffBookingsPage() {
  /* ---------- DATA ---------- */
  const [bookings, setBookings] = useState<AdminBookingResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  /* ---------- FILTER STATE ---------- */
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  /* ---------- PAGINATION ---------- */
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------- DETAIL DIALOG ---------- */
  const [selectedBooking, setSelectedBooking] =
    useState<AdminBookingResponse | null>(null);

  /* ---------- DERIVED ---------- */
  const hasActiveFilters =
    !!search || !!status || !!dateFrom || !!dateTo || !!minPrice || !!maxPrice;

  /* ---------- RESET PAGE ON FILTER CHANGE ---------- */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, dateFrom, dateTo, minPrice, maxPrice]);

  /* ---------- FETCH DATA ---------- */
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffBookingService.getAll({
        search: search || undefined,
        status: status || undefined,
        dateFrom: dateFrom ? `${dateFrom}T00:00:00` : undefined,
        dateTo: dateTo ? `${dateTo}T23:59:59` : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        page: currentPage - 1, // Spring Pageable is 0-based
        size: ITEMS_PER_PAGE,
        sort: 'createdAt,desc',
      });

      const page = res.data.data;
      setBookings(page.items);
      setTotal(page.totalItems);
      setTotalPages(page.totalPages);
    } catch (error) {
      handleError(error, 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [search, status, dateFrom, dateTo, minPrice, maxPrice, currentPage]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  /* ---------- RESET FILTERS ---------- */
  const handleReset = () => {
    setSearch('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <div className="p-8 space-y-6">
      <BookingHeader total={total} />

      <BookingStats bookings={bookings} total={total} />

      <BookingFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={(v) => setStatus(v === 'all' ? '' : v)}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        minPrice={minPrice}
        onMinPriceChange={setMinPrice}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        onReset={handleReset}
        hasActiveFilters={hasActiveFilters}
      />

      <BookingTable
        bookings={bookings}
        loading={loading}
        onViewDetail={(booking) => setSelectedBooking(booking)}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        start={(currentPage - 1) * ITEMS_PER_PAGE + 1}
        end={Math.min(currentPage * ITEMS_PER_PAGE, total)}
        total={total}
        onPrev={() => setCurrentPage((p) => Math.max(1, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
      />

      <BookingDetailDialog
        booking={selectedBooking}
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </div>
  );
}
