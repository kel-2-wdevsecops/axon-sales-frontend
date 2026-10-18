import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, AXIS_TITLE_STYLE, CHART_COLORS, CHART_GRID, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { formatCompact, formatUsd } from '@/lib/format';
import { summarizeYearBars, type YearBar } from '@/lib/growth';

interface SalesProfitByYearChartProps {
  bars: YearBar[];
}

/** Penjualan dan profit per tahun (kolom berkelompok); tahun parsial berlabel periodenya. */
export function SalesProfitByYearChart({ bars }: SalesProfitByYearChartProps) {
  const hasPartial = bars.some((b) => b.isPartial);

  return (
    <ChartCard
      title="Penjualan dan profit per tahun"
      description={hasPartial ? 'Tahun yang belum lengkap diberi keterangan periodenya.' : undefined}
      summary={summarizeYearBars(bars)}
      empty={bars.length === 0}
      emptyText="Tidak ada penjualan untuk filter ini."
      table={
        <ChartTable
          caption="Penjualan dan profit per tahun"
          headers={['Tahun', 'Penjualan', 'Profit']}
          rows={bars.map((b) => ({ key: String(b.year), cells: [b.label, formatUsd(b.sales), formatUsd(b.profit)] }))}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bars} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <CartesianGrid vertical={false} stroke={CHART_GRID} />
          <XAxis
            dataKey="label"
            height={44}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Tahun', position: 'insideBottom', offset: 4, ...AXIS_TITLE_STYLE }}
          />
          <YAxis
            width={72}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            tickFormatter={(v: number) => formatCompact(v)}
            label={{ value: 'Nilai (US$)', angle: -90, position: 'insideLeft', ...AXIS_TITLE_STYLE }}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-line-soft)' }}
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => formatUsd(Number(value))}
          />
          <Legend verticalAlign="top" align="right" iconType="square" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="sales" name="Penjualan" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
          <Bar dataKey="profit" name="Profit" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
