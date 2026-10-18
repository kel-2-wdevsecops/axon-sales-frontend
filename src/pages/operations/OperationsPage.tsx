import { FilterBar } from '@/components/filters/FilterBar';
import { QueryState } from '@/components/feedback/QueryState';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDashboardFilter } from '@/hooks/useDashboardFilter';
import { useOperations } from '@/hooks/useOperations';
import { OperationsContent } from './OperationsContent';

/**
 * Operasional order (F05, route `/operasional`): KPI order, status order,
 * order yang perlu perhatian, dan lama pengiriman. Angka datang dari BE
 * (GET /dashboard/operations); FE hanya memformat dan menyusun tampilan.
 * Bagian indikasi piutang (P2) belum ada di halaman ini (branch `feat/f05-piutang`).
 */
export function OperationsPage() {
  const { filter, optionsLoading, hasFilter } = useDashboardFilter('operations');
  // Tunggu pilihan filter agar nilai dari URL yang tidak valid dibuang dulu, bukan dikirim ke BE (422).
  const operations = useOperations(filter, { enabled: !optionsLoading });
  const isLoading = operations.data === undefined && !operations.error;

  return (
    <>
      <PageHeader
        title="Operasional Order"
        subtitle="Order yang tertahan, disengketakan, masih diproses, atau terlambat dikirim, dan seberapa cepat order dikirim."
      />

      <FilterBar page="operations" updating={operations.isPlaceholderData} />

      <QueryState isLoading={isLoading} error={operations.error}>
        {operations.data && <OperationsContent data={operations.data} status={filter.status} hasFilter={hasFilter} />}
      </QueryState>
    </>
  );
}
