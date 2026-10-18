import { FilterBar } from '@/components/filters/FilterBar';
import { QueryState } from '@/components/feedback/QueryState';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDashboardFilter } from '@/hooks/useDashboardFilter';
import { useGrowth } from '@/hooks/useGrowth';
import { GrowthContent } from './GrowthContent';

/**
 * Analisis pertumbuhan (F03, route `/pertumbuhan`): YTD, tabel YoY/QoQ/MoM,
 * dan grafik penjualan-profit per tahun. Angka datang dari BE
 * (GET /dashboard/growth); FE hanya memformat dan menyusun tampilan.
 */
export function GrowthPage() {
  const { filter, optionsLoading, hasFilter } = useDashboardFilter('growth');
  // Tunggu pilihan filter agar tahun dari URL yang tidak valid dibuang dulu, bukan dikirim ke BE (422).
  const growth = useGrowth(filter, { enabled: !optionsLoading });
  const isLoading = growth.data === undefined && !growth.error;

  return (
    <>
      <PageHeader
        title="Analisis Pertumbuhan"
        subtitle="Apakah penjualan tumbuh dibanding tahun, kuartal, dan bulan sebelumnya."
      />

      <FilterBar page="growth" updating={growth.isPlaceholderData} />

      <QueryState isLoading={isLoading} error={growth.error}>
        {growth.data && <GrowthContent data={growth.data} hasFilter={hasFilter} />}
      </QueryState>
    </>
  );
}
