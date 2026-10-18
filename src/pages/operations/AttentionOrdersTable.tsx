import { useId } from 'react';
import { DataTable, type Column } from '@/components/table/DataTable';
import { formatNumber, formatUsd } from '@/lib/format';
import { formatOrderDate, ORDER_NOTE_MAX } from '@/lib/operations';
import type { AttentionOrder } from '@/types';
import { OrderNote } from './OrderNote';
import { StatusBadge } from './StatusBadge';

// 7 kolom baru muat nyaman mulai `lg`; di bawahnya tiap baris menjadi kartu (tanpa gulir horizontal).
const GRID_TEMPLATE =
  'minmax(0,0.8fr) minmax(0,1.2fr) minmax(0,1.2fr) minmax(0,1.15fr) minmax(0,1.5fr) minmax(0,1.15fr) minmax(0,2.6fr)';

const COLUMNS: Column<AttentionOrder>[] = [
  {
    id: 'orderNumber',
    label: 'No. order',
    render: (r) => <span className="tnum text-[13px] font-medium text-ink">{r.orderNumber}</span>,
  },
  {
    id: 'orderDate',
    label: 'Tgl. order',
    render: (r) => <span className="text-[13px] text-ink-soft">{formatOrderDate(r.orderDate)}</span>,
  },
  {
    id: 'requiredDate',
    label: 'Tenggat',
    render: (r) => <span className="text-[13px] text-ink-soft">{formatOrderDate(r.requiredDate)}</span>,
  },
  {
    id: 'status',
    label: 'Status',
    render: (r) => <StatusBadge status={r.status} />,
  },
  {
    id: 'customerName',
    label: 'Customer',
    render: (r) => <span className="min-w-0 text-[13px] break-words text-ink">{r.customerName}</span>,
  },
  {
    id: 'sales',
    label: 'Nilai',
    align: 'right',
    render: (r) => <span className="tnum text-[13px] text-ink">{formatUsd(r.sales)}</span>,
  },
  {
    id: 'comments',
    label: 'Catatan',
    render: (r) => <OrderNote comments={r.comments} />,
  },
];

interface AttentionOrdersTableProps {
  rows: AttentionOrder[];
  /** Filter status aktif (menentukan teks keadaan kosong). */
  statusFilter?: string;
}

/**
 * Order yang perlu perhatian (On Hold, Disputed, In Process). Isi dan urutan
 * (tenggat terdekat dulu) ditentukan BE; nilai tidak dijumlahkan ulang.
 * Catatan adalah teks bebas: dirender sebagai teks biasa dan dipotong 160 karakter.
 */
export function AttentionOrdersTable({ rows, statusFilter }: AttentionOrdersTableProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="flex min-w-0 flex-col gap-2">
      <header className="flex flex-col gap-0.5">
        <h2 id={titleId} className="m-0 text-[14px] font-semibold text-ink">
          Order perlu perhatian
        </h2>
        <p className="m-0 text-[12px] text-ink-muted">
          {`Order On Hold, Disputed, dan In Process, dari tenggat terdekat. Nilai dalam US$. Catatan dipotong ${ORDER_NOTE_MAX} karakter; teks lengkap muncul saat kursor diarahkan ke catatan.`}
        </p>
      </header>
      <DataTable
        dense
        cardsBelow="lg"
        columns={COLUMNS}
        rows={rows}
        rowKey={(r) => String(r.orderNumber)}
        gridTemplate={GRID_TEMPLATE}
        empty={
          statusFilter
            ? `Tidak ada order perlu perhatian dengan status ${statusFilter}.`
            : 'Tidak ada order yang perlu perhatian untuk filter ini.'
        }
        footer={<span className="tnum text-[12px] text-ink-muted">{`Menampilkan ${formatNumber(rows.length)} order`}</span>}
      />
    </section>
  );
}
