import { useId } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDays } from '@/lib/operations';
import type { Operations } from '@/types';

interface SlowestShipmentsProps {
  rows: Operations['slowestShipments'];
}

/** Daftar pengiriman terlama (maksimal 5 dari BE, hari terbanyak dulu). Selisih hari dihitung BE. */
export function SlowestShipments({ rows }: SlowestShipmentsProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface px-4 py-3.5"
    >
      <header className="flex flex-col gap-0.5">
        <h3 id={titleId} className="m-0 text-[14px] font-semibold text-ink">
          Pengiriman terlama
        </h3>
        <p className="m-0 text-[12px] text-ink-muted">Lima order dengan selisih hari terbesar antara tanggal order dan tanggal kirim.</p>
      </header>

      {rows.length === 0 ? (
        <EmptyState dashed>Belum ada order terkirim untuk filter ini.</EmptyState>
      ) : (
        <ol className="m-0 flex list-none flex-col p-0">
          {rows.map((row, index) => (
            <li
              key={row.orderNumber}
              className="flex items-start justify-between gap-3 border-t border-line-soft py-2 first:border-t-0 first:pt-0"
            >
              <span className="flex min-w-0 items-start gap-2.5">
                <span className="tnum w-4 shrink-0 text-[12px] text-ink-faint">{index + 1}.</span>
                <span className="flex min-w-0 flex-col">
                  <span className="tnum text-[13px] font-medium text-ink">{`Order ${row.orderNumber}`}</span>
                  <span className="min-w-0 text-[12px] break-words text-ink-muted">{row.customerName}</span>
                </span>
              </span>
              <span className="tnum shrink-0 text-[13px] font-medium text-ink">{formatDays(row.days)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
