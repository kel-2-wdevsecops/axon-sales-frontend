import { useId, useMemo, useState } from 'react';
import { DataTable, type Column, type TableSort } from '@/components/table/DataTable';
import { nextSort, sortRows, type SortState, type SortValue } from '@/lib/customers';
import { formatNumber } from '@/lib/format';

interface SortableTableProps<T, K extends string> {
  title: string;
  description?: string;
  /** Kolom pertama menjadi judul kartu di layar kecil. `id` kolom yang `sortable` harus anggota `K`. */
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  gridTemplate: string;
  /** Label per kolom yang bisa diurutkan (untuk pilihan urutan di layar kecil). */
  sortLabels: Record<K, string>;
  accessors: Record<K, (row: T) => SortValue>;
  /** Kolom teks: arah awal A-Z; kolom lain mulai dari nilai terbesar. */
  textKeys: readonly K[];
  initialSort: SortState<K>;
  /** Nama baris untuk pengumuman pembaca layar, mis. "customer". */
  unit: string;
  empty: string;
  rowClassName?: (row: T) => string | undefined;
}

/**
 * Tabel dengan pengurutan kolom. Baris sudah berasal dari BE; di sini hanya
 * diurutkan ulang (tanpa menghitung angka). Di bawah `lg` baris menjadi kartu
 * (tanpa gulir horizontal), jadi urutan dipilih lewat kontrol terpisah karena
 * header kolom tersembunyi.
 */
export function SortableTable<T, K extends string>({
  title,
  description,
  columns,
  rows,
  rowKey,
  gridTemplate,
  sortLabels,
  accessors,
  textKeys,
  initialSort,
  unit,
  empty,
  rowClassName,
}: SortableTableProps<T, K>) {
  const id = useId();
  const [sort, setSort] = useState<SortState<K>>(initialSort);
  const sorted = useMemo(() => sortRows(rows, sort, accessors), [rows, sort, accessors]);

  const keys = Object.keys(sortLabels) as K[];
  const isKey = (value: string): value is K => (keys as string[]).includes(value);
  const directionText = sort.direction === 'asc' ? 'naik' : 'menurun';
  const tableSort: TableSort = { columnId: sort.key, direction: sort.direction };

  return (
    <section aria-labelledby={`${id}-title`} className="flex min-w-0 flex-col gap-3">
      <header className="flex flex-col gap-0.5">
        <h3 id={`${id}-title`} className="m-0 text-[14px] font-semibold text-ink">
          {title}
        </h3>
        {description && <p className="m-0 text-[12px] text-ink-muted">{description}</p>}
      </header>

      <div className="flex items-end gap-2 lg:hidden">
        <div className="flex min-w-[9rem] flex-col gap-1">
          <label htmlFor={`${id}-sort`} className="text-[12px] font-medium text-ink-muted">
            Urutkan menurut
          </label>
          <select
            id={`${id}-sort`}
            value={sort.key}
            onChange={(event) => {
              const key = event.target.value;
              if (isKey(key)) setSort({ key, direction: textKeys.includes(key) ? 'asc' : 'desc' });
            }}
            className="h-9 w-full cursor-pointer rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {keys.map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setSort((current) => ({ ...current, direction: current.direction === 'asc' ? 'desc' : 'asc' }))}
          aria-label={`Arah urutan: ${directionText}. Klik untuk membalik.`}
          className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink-soft hover:bg-line-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {sort.direction === 'asc' ? 'Naik' : 'Menurun'}
        </button>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {`${formatNumber(sorted.length)} ${unit}, diurutkan menurut ${sortLabels[sort.key]} ${directionText}.`}
      </p>

      <DataTable
        dense
        columns={columns}
        rows={sorted}
        rowKey={rowKey}
        gridTemplate={gridTemplate}
        cardsBelow="lg"
        sort={tableSort}
        onSort={(columnId) => {
          if (isKey(columnId)) setSort((current) => nextSort(current, columnId, textKeys));
        }}
        rowClassName={rowClassName}
        empty={empty}
      />
    </section>
  );
}
