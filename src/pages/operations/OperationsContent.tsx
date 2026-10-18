import { useMemo } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { isOperationsEmpty, toLeadTimeColumns } from '@/lib/operations';
import type { Operations } from '@/types';
import { AttentionOrdersTable } from './AttentionOrdersTable';
import { OperationsKpiSection } from './OperationsKpiSection';
import { OrdersByStatusChart } from './OrdersByStatusChart';
import { SalesByStatusChart } from './SalesByStatusChart';
import { ShippingLeadTimeChart } from './ShippingLeadTimeChart';
import { SlowestShipments } from './SlowestShipments';

interface OperationsContentProps {
  data: Operations;
  /** Filter status aktif; hanya memengaruhi grafik status dan daftar order perlu perhatian. */
  status?: string;
  /** Ada filter aktif (menentukan teks keadaan kosong). */
  hasFilter: boolean;
}

/** Isi halaman Operasional Order setelah data ada: KPI, status order, order perlu perhatian, lalu lama pengiriman. */
export function OperationsContent({ data, status, hasFilter }: OperationsContentProps) {
  const leadTimeColumns = useMemo(() => toLeadTimeColumns(data.shippingLeadTime), [data.shippingLeadTime]);

  if (isOperationsEmpty(data)) {
    return (
      <EmptyState dashed>
        {hasFilter ? 'Tidak ada data order untuk filter ini. Ubah atau reset filter.' : 'Belum ada data order.'}
      </EmptyState>
    );
  }

  return (
    <>
      <OperationsKpiSection kpi={data.kpi} asOf={data.asOf} />

      {status && (
        <p className="m-0 text-[12px] text-ink-muted">
          Filter status hanya memengaruhi grafik status dan daftar order perlu perhatian; indikator di atas dan lama pengiriman
          tidak berubah.
        </p>
      )}

      <div className="grid gap-3.5 lg:grid-cols-2">
        <OrdersByStatusChart rows={data.statusBreakdown} />
        <SalesByStatusChart rows={data.statusBreakdown} />
      </div>

      <AttentionOrdersTable rows={data.attentionOrders} statusFilter={status} />

      <div className="grid gap-3.5 lg:grid-cols-2">
        <ShippingLeadTimeChart columns={leadTimeColumns} />
        <SlowestShipments rows={data.slowestShipments} />
      </div>

      <p className="m-0 text-[12px] text-ink-muted">
        Semua angka dihitung oleh server. Lewat tenggat dihitung terhadap tanggal order terakhir di data, bukan tanggal hari ini.
      </p>
    </>
  );
}
