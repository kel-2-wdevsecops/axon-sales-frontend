import { useId } from 'react';
import { KpiCard } from '@/components/ui/KpiCard';
import { formatUsd } from '@/lib/format';
import { summarizeYtd, ytdPeriodLabel } from '@/lib/growth';
import type { YearToDate } from '@/types';
import { GrowthValue } from './GrowthValue';

interface YtdSectionProps {
  ytd: YearToDate;
}

/**
 * Perbandingan sepadan tahun berjalan: Januari s.d. bulan terakhir data tahun
 * ini vs rentang bulan yang sama tahun lalu. Dihitung BE dan tidak terpengaruh
 * filter, sehingga tahun parsial tidak terbaca sebagai penjualan anjlok.
 */
export function YtdSection({ ytd }: YtdSectionProps) {
  const headingId = useId();
  const labelId = useId();
  const now = ytdPeriodLabel(ytd.year, ytd.throughMonth);
  const before = ytdPeriodLabel(ytd.year - 1, ytd.throughMonth);

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <header className="flex flex-col gap-0.5">
        <h2 id={headingId} className="m-0 text-[14px] font-semibold text-ink">
          Tahun berjalan (YTD)
        </h2>
        <p className="m-0 text-[12px] text-ink-muted">
          {now} dibandingkan {before}. Tidak terpengaruh filter tahun.
        </p>
      </header>
      <p className="sr-only">{summarizeYtd(ytd)}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label={`Penjualan ${now}`} value={formatUsd(ytd.sales)} />
        <KpiCard label={`Penjualan ${before}`} value={formatUsd(ytd.previous)} />
        <div
          role="group"
          aria-labelledby={labelId}
          className="flex min-w-0 flex-col gap-1 rounded-xl border border-line bg-surface px-4 py-3.5"
        >
          <p id={labelId} className="m-0 text-[12px] font-medium text-ink-muted">
            Pertumbuhan YTD
          </p>
          <p className="m-0 text-[18px] leading-tight tracking-tight sm:text-[22px]">
            <GrowthValue pct={ytd.growthPct} />
          </p>
          <p className="m-0 text-[12px] text-ink-muted">
            {now} vs {before}
          </p>
        </div>
      </div>
    </section>
  );
}
