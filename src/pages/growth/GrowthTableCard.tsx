import { useId } from 'react';
import { DataTable, type Column } from '@/components/table/DataTable';
import { formatUsd } from '@/lib/format';
import type { GrowthPoint } from '@/types';
import { GrowthValue } from './GrowthValue';
import { PartialBadge } from './PartialBadge';

interface GrowthTableCardProps<T extends GrowthPoint> {
  title: string;
  description?: string;
  /** Judul kolom pertama, mis. "Tahun", "Kuartal", "Bulan". */
  periodHeader: string;
  /** Judul kolom pembanding, mis. "Tahun sebelumnya". */
  previousHeader: string;
  rows: T[];
  rowKey: (row: T) => string;
  /** Label periode baris (`Q1 2004`, `Januari 2004`). */
  periodLabel: (row: T) => string;
  /** Tooltip baris parsial, mis. "data sampai 31 Mei 2005". */
  partialTooltip: string;
  empty: string;
}

const GRID = 'minmax(0,1.3fr) minmax(0,1fr) minmax(0,1fr) minmax(0,0.9fr)';

/**
 * Tabel pertumbuhan (YoY/QoQ/MoM) dengan `DataTable`: periode, penjualan,
 * penjualan periode sebelumnya, dan pertumbuhan. Semua angka dari BE; di
 * layar sempit `DataTable` menjadi kartu per baris, jadi tidak meluap.
 */
export function GrowthTableCard<T extends GrowthPoint>({
  title,
  description,
  periodHeader,
  previousHeader,
  rows,
  rowKey,
  periodLabel,
  partialTooltip,
  empty,
}: GrowthTableCardProps<T>) {
  const titleId = useId();

  const columns: Column<T>[] = [
    {
      id: 'period',
      label: periodHeader,
      render: (row) => (
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-ink">
          {periodLabel(row)}
          {row.isPartial && <PartialBadge tooltip={partialTooltip} />}
        </span>
      ),
    },
    {
      id: 'sales',
      label: 'Penjualan',
      align: 'right',
      render: (row) => <span className="tnum text-[13px] text-ink">{formatUsd(row.sales)}</span>,
    },
    {
      id: 'previous',
      label: previousHeader,
      align: 'right',
      render: (row) => <span className="tnum text-[13px] text-ink-soft">{formatUsd(row.previous)}</span>,
    },
    {
      id: 'growth',
      label: 'Pertumbuhan',
      align: 'right',
      render: (row) => <GrowthValue pct={row.growthPct} className="text-[13px]" />,
    },
  ];

  return (
    <section aria-labelledby={titleId} className="flex min-w-0 flex-col gap-2">
      <header className="flex flex-col gap-0.5">
        <h3 id={titleId} className="m-0 text-[14px] font-semibold text-ink">
          {title}
        </h3>
        {description && <p className="m-0 text-[12px] text-ink-muted">{description}</p>}
      </header>
      <DataTable dense columns={columns} rows={rows} rowKey={rowKey} gridTemplate={GRID} empty={empty} />
    </section>
  );
}
