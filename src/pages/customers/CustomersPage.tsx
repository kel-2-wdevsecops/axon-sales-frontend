import { FilterBar } from '@/components/filters/FilterBar';
import { QueryState } from '@/components/feedback/QueryState';
import { PageHeader } from '@/components/layout/PageHeader';
import { useCustomers } from '@/hooks/useCustomers';
import { useDashboardFilter } from '@/hooks/useDashboardFilter';
import { CustomersContent } from './CustomersContent';

/**
 * Pelanggan dan tim sales (F04, route `/pelanggan`): KPI, Top 10 customer,
 * kinerja sales rep dan kantor, serta segmen credit limit. Angka datang dari BE
 * (GET /dashboard/customers); FE hanya memformat dan menyusun tampilan.
 */
export function CustomersPage() {
  const { filter, optionsLoading, hasFilter } = useDashboardFilter('customers');
  // Tunggu pilihan filter agar nilai dari URL yang tidak valid dibuang dulu, bukan dikirim ke BE (422).
  const customers = useCustomers(filter, { enabled: !optionsLoading });
  const isLoading = customers.data === undefined && !customers.error;

  return (
    <>
      <PageHeader
        title="Pelanggan dan Tim Sales"
        subtitle="Customer bernilai tinggi, prospek yang belum order, serta kinerja sales rep dan kantor."
      />

      <FilterBar page="customers" updating={customers.isPlaceholderData} />

      <QueryState isLoading={isLoading} error={customers.error}>
        {customers.data && <CustomersContent data={customers.data} hasFilter={hasFilter} />}
      </QueryState>
    </>
  );
}
