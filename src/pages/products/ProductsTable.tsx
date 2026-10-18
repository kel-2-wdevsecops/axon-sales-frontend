import { useId, useMemo, useState } from 'react';
import { DataTable, type Column, type TableSort } from '@/components/table/DataTable';
import { formatNumber } from '@/lib/format';
import {
  DEFAULT_PRODUCT_SORT,
  defaultSortDirection,
  nextProductSort,
  searchProducts,
  sortProducts,
  type ProductSort,
  type ProductSortKey,
} from '@/lib/productSearch';
import type { ProductRow } from '@/types';

// 7 kolom baru muat nyaman mulai `lg`; di bawahnya baris menjadi kartu (tanpa gulir horizontal).
const GRID_TEMPLATE =
  'minmax(0,1.7fr) minmax(0,1.1fr) minmax(0,1.15fr) minmax(0,1.05fr) minmax(0,1fr) minmax(0,0.85fr) minmax(0,1.4fr)';

const SORT_LABELS: Record<ProductSortKey, string> = {
  productName: 'Produk',
  productLine: 'Product line',
  sales: 'Penjualan',
  profit: 'Profit',
  quantity: 'Kuantitas',
  orders: 'Order',
  quantityInStock: 'Stok',
};

const SORT_KEYS = Object.keys(SORT_LABELS) as ProductSortKey[];

const directionText = (sort: ProductSort) => (sort.direction === 'asc' ? 'naik' : 'menurun');

function WarningIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0">
      <path d="M12 3.5 2.5 20h19z" />
      <path d="M12 10v5M12 18v.01" />
    </svg>
  );
}

/** Penanda stok rendah: ikon + teks (bukan hanya warna). Ambang ditentukan BE (`lowStock`). */
function LowStockBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-note-soft px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-note-ink">
      <WarningIcon />
      Stok rendah
    </span>
  );
}

const money = (value: number) => formatNumber(value, 2);

/** Kolom tabel. Setiap `id` sama dengan field `ProductRow` yang dipakai pengurut. */
const COLUMNS: Column<ProductRow>[] = [
  {
    id: 'productName',
    label: SORT_LABELS.productName,
    sortable: true,
    render: (r) => (
      <span title={r.productName} className="min-w-0 text-[13px] font-medium break-words text-ink lg:truncate">
        {r.productName}
      </span>
    ),
  },
  {
    id: 'productLine',
    label: SORT_LABELS.productLine,
    sortable: true,
    render: (r) => <span className="min-w-0 text-[13px] text-ink-soft lg:truncate">{r.productLine}</span>,
  },
  {
    id: 'sales',
    label: SORT_LABELS.sales,
    sortable: true,
    align: 'right',
    render: (r) => <span className="tnum text-[13px] text-ink">{money(r.sales)}</span>,
  },
  {
    id: 'profit',
    label: SORT_LABELS.profit,
    sortable: true,
    align: 'right',
    render: (r) => <span className="tnum text-[13px] text-ink-soft">{money(r.profit)}</span>,
  },
  {
    id: 'quantity',
    label: SORT_LABELS.quantity,
    sortable: true,
    align: 'right',
    render: (r) => <span className="tnum text-[13px] text-ink-soft">{formatNumber(r.quantity)}</span>,
  },
  {
    id: 'orders',
    label: SORT_LABELS.orders,
    sortable: true,
    align: 'right',
    render: (r) => <span className="tnum text-[13px] text-ink-soft">{formatNumber(r.orders)}</span>,
  },
  {
    id: 'quantityInStock',
    label: SORT_LABELS.quantityInStock,
    sortable: true,
    align: 'right',
    render: (r) => (
      <span className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1">
        <span className="tnum text-[13px] text-ink-soft">{formatNumber(r.quantityInStock)}</span>
        {r.lowStock && <LowStockBadge />}
      </span>
    ),
  },
];

const isSortKey = (value: string): value is ProductSortKey => (SORT_KEYS as string[]).includes(value);

interface ProductsTableProps {
  rows: ProductRow[];
}

/**
 * Tabel produk: pencarian nama, pengurutan kolom (urutan awal penjualan
 * menurun), dan penanda stok rendah. Semua pengolahan di sini hanya memilih
 * dan mengurutkan baris dari BE; angkanya tidak dihitung ulang.
 */
export function ProductsTable({ rows }: ProductsTableProps) {
  const searchId = useId();
  const sortId = useId();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<ProductSort>(DEFAULT_PRODUCT_SORT);

  const visible = useMemo(() => sortProducts(searchProducts(rows, query), sort), [rows, query, sort]);
  const searching = query.trim() !== '';
  const tableSort: TableSort = { columnId: sort.key, direction: sort.direction };

  const onSort = (columnId: string) => {
    if (isSortKey(columnId)) setSort((current) => nextProductSort(current, columnId));
  };

  return (
    <section aria-labelledby={`${searchId}-title`} className="flex min-w-0 flex-col gap-3">
      <header className="flex flex-col gap-0.5">
        <h2 id={`${searchId}-title`} className="m-0 text-[14px] font-semibold text-ink">
          Daftar produk
        </h2>
        <p className="m-0 text-[12px] text-ink-muted">
          Penjualan dan profit dalam US$. Produk tanpa penjualan pada filter ini tetap tampil dengan nilai 0. Penanda stok rendah ditentukan oleh server.
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-[12rem] flex-1 flex-col gap-1 sm:max-w-sm">
          <label htmlFor={searchId} className="text-[12px] font-medium text-ink-muted">
            Cari nama produk
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="Mis. Ferrari"
            className="h-9 w-full rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </div>

        {/* Header kolom tersembunyi di layar kecil (baris menjadi kartu), jadi urutan dipilih lewat sini. */}
        <div className="flex items-end gap-2 lg:hidden">
          <div className="flex min-w-[9rem] flex-col gap-1">
            <label htmlFor={sortId} className="text-[12px] font-medium text-ink-muted">
              Urutkan menurut
            </label>
            <select
              id={sortId}
              value={sort.key}
              onChange={(event) => {
                const key = event.target.value;
                if (isSortKey(key)) setSort({ key, direction: defaultSortDirection(key) });
              }}
              className="h-9 w-full cursor-pointer rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {SORT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {SORT_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => setSort((current) => ({ ...current, direction: current.direction === 'asc' ? 'desc' : 'asc' }))}
            aria-label={`Arah urutan: ${directionText(sort)}. Klik untuk membalik.`}
            className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink-soft hover:bg-line-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {sort.direction === 'asc' ? 'Naik' : 'Menurun'}
          </button>
        </div>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {`${formatNumber(visible.length)} dari ${formatNumber(rows.length)} produk, diurutkan menurut ${SORT_LABELS[sort.key]} ${directionText(sort)}.`}
      </p>

      <DataTable
        columns={COLUMNS}
        rows={visible}
        rowKey={(r) => r.productCode}
        gridTemplate={GRID_TEMPLATE}
        dense
        cardsBelow="lg"
        sort={tableSort}
        onSort={onSort}
        rowClassName={(r) => (r.lowStock ? 'bg-note-soft/40' : undefined)}
        empty={
          rows.length === 0
            ? 'Tidak ada produk untuk filter ini.'
            : searching
              ? `Tidak ada produk yang namanya memuat "${query.trim()}".`
              : 'Tidak ada produk.'
        }
        footer={
          <span className="tnum text-[12px] text-ink-muted">
            {`Menampilkan ${formatNumber(visible.length)} dari ${formatNumber(rows.length)} produk`}
          </span>
        }
      />
    </section>
  );
}
