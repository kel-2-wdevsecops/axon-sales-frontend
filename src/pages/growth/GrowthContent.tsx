import { useMemo } from 'react';
import { EmptyState } from '@/components/ui/EmptyState';
import { isGrowthEmpty, monthLabel, partialTooltip, quarterLabel, toYearBars, yearLabel } from '@/lib/growth';
import { partialYearLabeler } from '@/lib/overviewChart';
import type { Growth } from '@/types';
import { GrowthTableCard } from './GrowthTableCard';
import { SalesProfitByYearChart } from './SalesProfitByYearChart';
import { YtdSection } from './YtdSection';

interface GrowthContentProps {
  data: Growth;
  /** Ada filter tahun aktif (menentukan teks keadaan kosong). */
  hasFilter: boolean;
}

/** Isi halaman Pertumbuhan setelah data ada: kartu YTD, tabel YoY/QoQ/MoM, lalu grafik. */
export function GrowthContent({ data, hasFilter }: GrowthContentProps) {
  const yearBars = useMemo(
    () => toYearBars(data, partialYearLabeler(data.dataRange)),
    [data],
  );

  if (isGrowthEmpty(data)) {
    return (
      <EmptyState dashed>
        {hasFilter ? 'Tidak ada data pertumbuhan untuk filter ini. Ubah atau reset filter.' : 'Belum ada data penjualan.'}
      </EmptyState>
    );
  }

  const tooltip = partialTooltip(data.dataRange.to);

  return (
    <>
      {data.ytd && <YtdSection ytd={data.ytd} />}

      <div className="grid gap-3.5 2xl:grid-cols-2">
        <GrowthTableCard
          title="Pertumbuhan tahunan (YoY)"
          description="Dibandingkan tahun kalender sebelumnya."
          periodHeader="Tahun"
          previousHeader="Tahun sebelumnya"
          rows={data.yearly}
          rowKey={(row) => String(row.year)}
          periodLabel={(row) => yearLabel(row.year)}
          partialTooltip={tooltip}
          empty="Tidak ada data tahunan untuk filter ini."
        />
        <SalesProfitByYearChart bars={yearBars} />
      </div>

      <GrowthTableCard
        title="Pertumbuhan per kuartal (QoQ)"
        description="Dibandingkan kuartal sebelumnya, termasuk kuartal yang sedang berjalan."
        periodHeader="Kuartal"
        previousHeader="Kuartal sebelumnya"
        rows={data.quarterly}
        rowKey={(row) => `${row.year}-Q${row.quarter}`}
        periodLabel={(row) => quarterLabel(row.year, row.quarter)}
        partialTooltip={tooltip}
        empty="Tidak ada data kuartalan untuk filter ini."
      />

      <GrowthTableCard
        title="Pertumbuhan bulanan (MoM)"
        description="Dibandingkan bulan sebelumnya; Januari dibandingkan dengan Desember tahun sebelumnya."
        periodHeader="Bulan"
        previousHeader="Bulan sebelumnya"
        rows={data.monthly}
        rowKey={(row) => `${row.year}-${row.month}`}
        periodLabel={(row) => monthLabel(row.year, row.month)}
        partialTooltip={tooltip}
        empty="Tidak ada data bulanan untuk filter ini."
      />

      <p className="m-0 text-[12px] text-ink-muted">
        Pertumbuhan dihitung oleh server terhadap periode kalender sebelumnya. Tanda -- berarti tidak ada periode
        pembanding.
      </p>
    </>
  );
}
