import { useMemo } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { toggleValue, type FilterChange } from '@/lib/filterState';
import { isProductsEmpty, toMonthColumns, toYearOrderColumns } from '@/lib/productsChart';
import type { DashboardFilter, FilterOptions, Products } from '@/types';
import { OrdersByMonthChart } from './OrdersByMonthChart';
import { OrdersByYearChart } from './OrdersByYearChart';
import { ProductsKpiSection } from './ProductsKpiSection';
import { ProductsTable } from './ProductsTable';
import { SalesByProductLineChart } from './SalesByProductLineChart';
import { TopVendorsChart } from './TopVendorsChart';

interface ProductsContentProps {
  data: Products;
  filter: DashboardFilter;
  /** Pilihan filter dari BE (dipakai untuk rentang data/tahun parsial); undefined selama belum termuat. */
  options?: FilterOptions;
  hasFilter: boolean;
  onFilter: (change: FilterChange) => void;
}

/** Isi halaman Analisis Produk setelah data ada: KPI, empat grafik, lalu tabel produk. */
export function ProductsContent({ data, filter, options, hasFilter, onFilter }: ProductsContentProps) {
  const dataRange = options?.dataRange;
  const monthColumns = useMemo(() => toMonthColumns(data.ordersByMonth), [data.ordersByMonth]);
  const yearColumns = useMemo(() => toYearOrderColumns(data.ordersByYear, dataRange), [data.ordersByYear, dataRange]);
  const selectedLines = filter.productLine ?? [];

  if (isProductsEmpty(data)) {
    return (
      <EmptyState dashed>
        {hasFilter ? 'Tidak ada data produk untuk filter ini. Ubah atau reset filter.' : 'Belum ada data produk.'}
      </EmptyState>
    );
  }

  // Klik batang = tambah/hapus product line di filter yang sama dengan pilihan product line di bilah filter.
  const toggleLine = (productLine: string) => onFilter({ productLine: toggleValue(filter.productLine, productLine) });

  return (
    <>
      <ProductsKpiSection kpi={data.kpi} />

      <div className="grid gap-3.5 lg:grid-cols-2">
        <SalesByProductLineChart rows={data.salesByProductLine} selected={selectedLines} onToggleLine={toggleLine} />
        <OrdersByYearChart columns={yearColumns} hasPartial={yearColumns.some((c) => c.label !== String(c.year))} />
        <OrdersByMonthChart columns={monthColumns} />
        <TopVendorsChart rows={data.topVendors} />
      </div>

      <ProductsTable rows={data.products} />
    </>
  );
}
