import { EmptyState } from '@/components/ui/EmptyState';
import { isCustomersEmpty } from '@/lib/customers';
import type { Customers } from '@/types';
import { CreditSegmentsDonut } from './CreditSegmentsDonut';
import { CustomersKpiSection } from './CustomersKpiSection';
import { OfficesChart } from './OfficesChart';
import { SalesRepsChart } from './SalesRepsChart';
import { SalesRepsTable } from './SalesRepsTable';
import { ScopeNote } from './ScopeNote';
import { TopCustomersTable } from './TopCustomersTable';

interface CustomersContentProps {
  data: Customers;
  /** Ada filter aktif (menentukan teks keadaan kosong). */
  hasFilter: boolean;
}

/** Isi halaman Pelanggan setelah data ada: KPI, Top 10 customer, sales rep, kantor, dan segmen credit limit. */
export function CustomersContent({ data, hasFilter }: CustomersContentProps) {
  if (isCustomersEmpty(data)) {
    return (
      <EmptyState dashed>
        {hasFilter ? 'Tidak ada customer untuk filter ini. Ubah atau reset filter.' : 'Belum ada data customer.'}
      </EmptyState>
    );
  }

  return (
    <>
      <CustomersKpiSection kpi={data.kpi} />
      <ScopeNote />

      <TopCustomersTable rows={data.topCustomers} />

      <SalesRepsChart rows={data.salesReps} />
      <SalesRepsTable rows={data.salesReps} />

      <div className="grid gap-3.5 lg:grid-cols-2">
        <OfficesChart rows={data.offices} />
        <CreditSegmentsDonut rows={data.creditSegments} />
      </div>
    </>
  );
}
