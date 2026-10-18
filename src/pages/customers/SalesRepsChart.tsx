import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, AXIS_TITLE_STYLE, CHART_COLORS, CHART_GRID, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { summarizeSalesReps } from '@/lib/customers';
import { formatCompact, formatUsd } from '@/lib/format';
import { truncateLabel } from '@/lib/productsChart';
import type { SalesRepRow } from '@/types';

interface SalesRepsChartProps {
  rows: SalesRepRow[];
}

/**
 * Penjualan per sales rep (bar horizontal, urutan BE: terbesar di atas).
 * Alternatif tabelnya adalah tabel rincian tepat di bawah kartu ini, yang
 * memuat semua kolom dan bisa diurutkan, jadi tidak diulang di dalam kartu.
 */
export function SalesRepsChart({ rows }: SalesRepsChartProps) {
  return (
    <ChartCard
      title="Penjualan per sales rep"
      description="Dihitung dari customer yang dipegang sales rep saat ini. Rincian lengkap ada di tabel di bawah grafik."
      summary={summarizeSalesReps(rows)}
      empty={rows.length === 0}
      emptyText="Tidak ada sales rep untuk filter ini."
      chartClassName="h-[32rem]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <CartesianGrid horizontal={false} stroke={CHART_GRID} />
          <XAxis
            type="number"
            height={44}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            tickFormatter={(v: number) => formatCompact(v)}
            label={{ value: 'Penjualan (US$)', position: 'insideBottom', offset: 4, ...AXIS_TITLE_STYLE }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={132}
            interval={0}
            tick={AXIS_TICK}
            tickFormatter={(v: string) => truncateLabel(v, 20)}
            stroke={CHART_GRID}
            label={{ value: 'Sales rep', angle: -90, position: 'insideLeft', ...AXIS_TITLE_STYLE }}
          />
          <Tooltip cursor={{ fill: 'var(--color-line-soft)' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => formatUsd(Number(value))} />
          <Bar dataKey="sales" name="Penjualan" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
