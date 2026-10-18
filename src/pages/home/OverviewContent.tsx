import { useMemo } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import type { FilterChange } from '@/lib/filterState';
import {
  groupCustomersByCountry,
  isOverviewEmpty,
  partialKpiLabel,
  partialYearLabeler,
  toYearColumns,
} from '@/lib/overviewChart';
import { relevantPartialPeriods } from '@/lib/period';
import type { DashboardFilter, FilterOptions, Overview } from '@/types';
import { ContinentDonut } from './ContinentDonut';
import { CustomersByCountryChart } from './CustomersByCountryChart';
import { KpiSection } from './KpiSection';
import { SalesByYearChart } from './SalesByYearChart';
import { TopCountriesChart } from './TopCountriesChart';

interface OverviewContentProps {
  data: Overview;
  filter: DashboardFilter;
  /** Pilihan filter dari BE (dipakai untuk rentang data/periode parsial); undefined selama belum termuat. */
  options?: FilterOptions;
  hasFilter: boolean;
  onFilter: (change: FilterChange) => void;
}

/** Isi halaman Ringkasan setelah data ada: KPI, lalu grafik. */
export function OverviewContent({ data, filter, options, hasFilter, onFilter }: OverviewContentProps) {
  const dataRange = options?.dataRange;
  const yearColumns = useMemo(() => toYearColumns(data.salesByYear, partialYearLabeler(dataRange)), [data.salesByYear, dataRange]);
  const countryBars = useMemo(() => groupCustomersByCountry(data.customersByCountry), [data.customersByCountry]);
  const partialLabel = dataRange ? partialKpiLabel(relevantPartialPeriods(filter, dataRange)) : undefined;

  if (isOverviewEmpty(data)) {
    return (
      <EmptyState dashed>
        {hasFilter ? 'Tidak ada data penjualan untuk filter ini. Ubah atau reset filter.' : 'Belum ada data penjualan.'}
      </EmptyState>
    );
  }

  return (
    <>
      <KpiSection kpi={data.kpi} partialLabel={partialLabel} />

      {/* Slot panel Sorotan (F07): dipasang di sini, di antara KPI dan grafik. Belum diisi di F01. */}

      <div className="grid gap-3.5 lg:grid-cols-2">
        <TopCountriesChart rows={data.topCountriesBySales} onSelectCountry={(country) => onFilter({ country })} />
        <SalesByYearChart columns={yearColumns} />
        <ContinentDonut rows={data.customersByContinent} onSelectContinent={(continent) => onFilter({ continent })} />
        <CustomersByCountryChart bars={countryBars} />
      </div>
    </>
  );
}
