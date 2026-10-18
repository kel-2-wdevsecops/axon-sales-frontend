import type { Column } from '@/components/table/DataTable';
import type { SortState, SortValue } from '@/lib/customers';
import { formatNumber, formatPercent, formatUsd } from '@/lib/format';
import type { TopCustomerRow } from '@/types';
import { SortableTable } from './SortableTable';

type Key = 'customerName' | 'country' | 'sales' | 'orders' | 'sharePct';

const SORT_LABELS: Record<Key, string> = {
  customerName: 'Perusahaan',
  country: 'Negara',
  sales: 'Penjualan',
  orders: 'Order',
  sharePct: 'Porsi penjualan',
};

const ACCESSORS: Record<Key, (row: TopCustomerRow) => SortValue> = {
  customerName: (r) => r.customerName,
  country: (r) => r.country,
  sales: (r) => r.sales,
  orders: (r) => r.orders,
  sharePct: (r) => r.sharePct,
};

const TEXT_KEYS: readonly Key[] = ['customerName', 'country'];

// Urutan BE: penjualan terbesar di atas.
const INITIAL_SORT: SortState<Key> = { key: 'sales', direction: 'desc' };

const GRID_TEMPLATE = 'minmax(0,2.2fr) minmax(0,1.1fr) minmax(0,1.3fr) minmax(0,0.7fr) minmax(0,1fr)';

// Data pribadi (kontak, telepon, alamat, credit limit) tidak ada di respons BE dan tidak ditampilkan.
const COLUMNS: Column<TopCustomerRow>[] = [
  {
    id: 'customerName',
    label: SORT_LABELS.customerName,
    sortable: true,
    render: (r) => (
      <span title={r.customerName} className="min-w-0 text-[13px] font-medium break-words text-ink lg:truncate">
        {r.customerName}
      </span>
    ),
  },
  {
    id: 'country',
    label: SORT_LABELS.country,
    sortable: true,
    render: (r) => <span className="min-w-0 text-[13px] text-ink-soft lg:truncate">{r.country}</span>,
  },
  {
    id: 'sales',
    label: SORT_LABELS.sales,
    sortable: true,
    align: 'right',
    render: (r) => <span className="tnum text-[13px] text-ink">{formatUsd(r.sales)}</span>,
  },
  {
    id: 'orders',
    label: SORT_LABELS.orders,
    sortable: true,
    align: 'right',
    render: (r) => <span className="tnum text-[13px] text-ink-soft">{formatNumber(r.orders)}</span>,
  },
  {
    id: 'sharePct',
    label: 'Porsi',
    sortable: true,
    align: 'right',
    render: (r) => <span className="tnum text-[13px] text-ink-soft">{formatPercent(r.sharePct)}</span>,
  },
];

interface TopCustomersTableProps {
  rows: TopCustomerRow[];
}

/** 10 customer dengan penjualan terbesar: nama perusahaan, negara, penjualan, order, dan porsi dari BE. */
export function TopCustomersTable({ rows }: TopCustomersTableProps) {
  return (
    <SortableTable
      title="10 customer dengan penjualan terbesar"
      description="Ikut filter tahun, benua, dan negara. Porsi = bagian dari total penjualan pada filter yang sama, dihitung oleh server. Hanya nama perusahaan yang ditampilkan."
      columns={COLUMNS}
      rows={rows}
      rowKey={(r) => String(r.customerNumber)}
      gridTemplate={GRID_TEMPLATE}
      sortLabels={SORT_LABELS}
      accessors={ACCESSORS}
      textKeys={TEXT_KEYS}
      initialSort={INITIAL_SORT}
      unit="customer"
      empty="Tidak ada penjualan customer untuk filter ini."
    />
  );
}
