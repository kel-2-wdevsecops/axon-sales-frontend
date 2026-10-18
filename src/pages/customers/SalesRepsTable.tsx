import type { Column } from '@/components/table/DataTable';
import type { SortState, SortValue } from '@/lib/customers';
import { formatNumber, formatUsd } from '@/lib/format';
import type { SalesRepRow } from '@/types';
import { SortableTable } from './SortableTable';

type Key = 'name' | 'office' | 'customers' | 'orders' | 'sales';

const SORT_LABELS: Record<Key, string> = {
  name: 'Sales rep',
  office: 'Kantor',
  customers: 'Customer',
  orders: 'Order',
  sales: 'Penjualan',
};

const ACCESSORS: Record<Key, (row: SalesRepRow) => SortValue> = {
  name: (r) => r.name,
  office: (r) => r.office,
  customers: (r) => r.customers,
  orders: (r) => r.orders,
  sales: (r) => r.sales,
};

const TEXT_KEYS: readonly Key[] = ['name', 'office'];

// Urutan BE: penjualan terbesar di atas.
const INITIAL_SORT: SortState<Key> = { key: 'sales', direction: 'desc' };

const GRID_TEMPLATE = 'minmax(0,1.8fr) minmax(0,1.2fr) minmax(0,0.9fr) minmax(0,0.8fr) minmax(0,1.3fr)';

const COLUMNS: Column<SalesRepRow>[] = [
  {
    id: 'name',
    label: SORT_LABELS.name,
    sortable: true,
    render: (r) => (
      <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <span className="min-w-0 text-[13px] font-medium break-words text-ink">{r.name}</span>
        {r.customers === 0 && (
          <span className="inline-flex items-center rounded-md bg-note-soft px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-note-ink">
            Tanpa customer
          </span>
        )}
      </span>
    ),
  },
  {
    id: 'office',
    label: SORT_LABELS.office,
    sortable: true,
    render: (r) => <span className="min-w-0 text-[13px] text-ink-soft lg:truncate">{r.office}</span>,
  },
  {
    id: 'customers',
    label: SORT_LABELS.customers,
    sortable: true,
    align: 'right',
    render: (r) => <span className="tnum text-[13px] text-ink-soft">{formatNumber(r.customers)}</span>,
  },
  {
    id: 'orders',
    label: SORT_LABELS.orders,
    sortable: true,
    align: 'right',
    render: (r) => <span className="tnum text-[13px] text-ink-soft">{formatNumber(r.orders)}</span>,
  },
  {
    id: 'sales',
    label: SORT_LABELS.sales,
    sortable: true,
    align: 'right',
    render: (r) => <span className="tnum text-[13px] text-ink">{formatUsd(r.sales)}</span>,
  },
];

interface SalesRepsTableProps {
  rows: SalesRepRow[];
}

/** Kinerja sales rep: nama, kantor, customer, order, dan penjualan. Rep tanpa customer tetap tampil dengan nilai 0. */
export function SalesRepsTable({ rows }: SalesRepsTableProps) {
  return (
    <SortableTable
      title="Rincian kinerja sales rep"
      description="Jumlah customer tidak berubah saat tahun diganti; order dan penjualan mengikuti filter. Sales rep tanpa customer pada filter ini tetap tampil dengan nilai 0."
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => String(r.employeeNumber)}
      gridTemplate={GRID_TEMPLATE}
      sortLabels={SORT_LABELS}
      accessors={ACCESSORS}
      textKeys={TEXT_KEYS}
      initialSort={INITIAL_SORT}
      unit="sales rep"
      empty="Tidak ada sales rep."
    />
  );
}
