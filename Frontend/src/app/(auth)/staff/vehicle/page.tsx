'use client';

import { useEffect, useState } from 'react';

import VehicleHeader from './components/VehicleHeader';
import VehicleStats from './components/VehicleStats';
import VehicleFilters from './components/VehicleFilters';
import VehicleTable from './components/VehicleTable';
import Pagination from '@/components/Pagination';

import { carTypeService } from '@/services/carTypeService';
import { carBrandService } from '@/services/brandService';

import { CarType } from '@/types/carType';
import { CarBrand } from '@/types/brand';

const ITEMS_PER_PAGE = 10;

export default function VehiclesPage() {
  /* ---------- STATE ---------- */
  const [vehicles, setVehicles] = useState<CarType[]>([]);
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [seatFilter, setSeatFilter] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  /* ---------- FILTER ---------- */
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  /* ---------- RESET PAGE ---------- */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, brandFilter, seatFilter, minPrice, maxPrice]);

  /* ---------- FETCH BRANDS ---------- */
  useEffect(() => {
    carBrandService.getAll({ page: 0, size: 1000 }).then((res) => {
      setBrands(res.data.data.items ?? []);
    });
  }, []);

  /* ---------- FETCH VEHICLES ---------- */
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        const res = await carTypeService.getAll({
          name: search || undefined,
          brandId: brandFilter !== 'all' ? brandFilter : undefined,
          numberOfSeats: seatFilter !== 'all' ? Number(seatFilter) : undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          page: currentPage - 1,
          size: ITEMS_PER_PAGE,
        });

        const pageData = res.data.data;

        let list: CarType[] = pageData.items ?? [];

        if (brandFilter !== 'all') {
          list = list.filter((v) => v.carBrand?.id === brandFilter);
        }

        if (seatFilter !== 'all') {
          list = list.filter((v) => v.numberOfSeats >= Number(seatFilter));
        }

        if (minPrice) {
          list = list.filter((v) => v.price >= Number(minPrice));
        }

        if (maxPrice) {
          list = list.filter((v) => v.price <= Number(maxPrice));
        }

        setVehicles(list);

        const effectiveTotal =
          brandFilter === 'all' ? pageData.totalItems : list.length;

        setTotal(effectiveTotal);
        setTotalPages(Math.max(1, Math.ceil(effectiveTotal / ITEMS_PER_PAGE)));
      } catch (e) {
        console.error('FETCH VEHICLES FAILED', e);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [search, brandFilter, seatFilter, minPrice, maxPrice, currentPage]);

  return (
    <div className="p-8 space-y-6">
      <VehicleHeader total={total} />

      <VehicleStats
        totalModels={total}
        totalBrands={brands.length}
        avgPrice={
          vehicles.length
            ? Math.round(
                vehicles.reduce((s, v) => s + v.price, 0) / vehicles.length
              )
            : 0
        }
      />

      <VehicleFilters
        search={search}
        brandFilter={brandFilter}
        seatFilter={seatFilter}
        minPrice={minPrice}
        maxPrice={maxPrice}
        brands={brands}
        onSearchChange={setSearch}
        onBrandChange={setBrandFilter}
        onSeatChange={setSeatFilter}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        onReset={() => {
          setSearch('');
          setBrandFilter('all');
          setSeatFilter('all');
          setMinPrice('');
          setMaxPrice('');
        }}
        total={total}
        filtered={vehicles.length}
      />

      <VehicleTable vehicles={vehicles} loading={loading} />

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
    </div>
  );
}
