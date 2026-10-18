import { FilterBar } from '@/components/filters/FilterBar';
import { QueryState } from '@/components/feedback/QueryState';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDashboardFilter } from '@/hooks/useDashboardFilter';
import { useOverview } from '@/hooks/useOverview';
import { ApiStatus } from './ApiStatus';
import { OverviewContent } from './OverviewContent';

/**
 * Ringkasan penjualan (F01, route `/`): filter, KPI, dan grafik utama.
 * Angka datang dari BE (GET /dashboard/overview); FE hanya memformat dan menyusun tampilan.
 */
export function HomePage() {
  const { filter, options, optionsLoading, hasFilter, setFilter } = useDashboardFilter('overview');
  // Tunggu pilihan filter agar nilai dari URL yang tidak valid dibuang dulu, bukan dikirim ke BE (422).
  const overview = useOverview(filter, { enabled: !optionsLoading });
  const isLoading = overview.data === undefined && !overview.error;

  return (
    <>
      <PageHeader
        title="Ringkasan Penjualan"
        subtitle="Kinerja penjualan, profit, dan customer Axon dalam satu layar."
      />

      <FilterBar page="overview" updating={overview.isPlaceholderData} />

      <QueryState isLoading={isLoading} error={overview.error}>
        {overview.data && (
          <OverviewContent data={overview.data} filter={filter} options={options} hasFilter={hasFilter} onFilter={setFilter} />
        )}
      </QueryState>

      <ApiStatus />
    </>
  );
}
