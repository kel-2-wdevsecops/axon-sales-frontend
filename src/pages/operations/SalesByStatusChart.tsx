import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, AXIS_TITLE_STYLE, CHART_COLORS, CHART_GRID, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { formatCompact, formatUsd } from '@/lib/format';
import { summarizeSalesByStatus } from '@/lib/operations';
import type { Operations } from '@/types';
import { StatusBadge } from './StatusBadge';

interface SalesByStatusChartProps {
  rows: Operations['statusBreakdown'];
}

/** Penjualan per status (bar horizontal): nilai yang terkunci di tiap status, termasuk Cancelled. Nilai dari BE apa adanya. */
export function SalesByStatusChart({ rows }: SalesByStatusChartProps) {
  return (
    <ChartCard
      title="Penjualan per status"
      description="Jumlah seluruh status sama dengan total penjualan, termasuk order yang dibatalkan."
      summary={summarizeSalesByStatus(rows)}
      empty={rows.length === 0}
      emptyText="Tidak ada penjualan untuk filter ini."
      chartClassName="h-72"
      table={
        <ChartTable
          caption="Penjualan per status"
          headers={['Status', 'Penjualan']}
          rows={rows.map((r) => ({ key: r.status, cells: [<StatusBadge key="s" status={r.status} />, formatUsd(r.sales)] }))}
        />
      }
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
            dataKey="status"
            width={100}
            interval={0}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Status', angle: -90, position: 'insideLeft', ...AXIS_TITLE_STYLE }}
          />
          <Tooltip cursor={{ fill: 'var(--color-line-soft)' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => formatUsd(Number(value))} />
          <Legend verticalAlign="top" align="right" iconType="square" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="sales" name="Penjualan" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
