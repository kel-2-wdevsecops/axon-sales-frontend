import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, AXIS_TITLE_STYLE, CHART_COLORS, CHART_GRID, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { formatNumber } from '@/lib/format';
import { summarizeOrdersByStatus } from '@/lib/operations';
import type { Operations } from '@/types';
import { StatusBadge } from './StatusBadge';

interface OrdersByStatusChartProps {
  rows: Operations['statusBreakdown'];
}

/** Jumlah order per status (bar horizontal), urutan dari BE (penjualan terbesar dulu). Jumlah dihitung BE, tidak dijumlahkan ulang. */
export function OrdersByStatusChart({ rows }: OrdersByStatusChartProps) {
  return (
    <ChartCard
      title="Jumlah order per status"
      description="Termasuk order yang dibatalkan. Urut dari status dengan penjualan terbesar."
      summary={summarizeOrdersByStatus(rows)}
      empty={rows.length === 0}
      emptyText="Tidak ada order untuk filter ini."
      chartClassName="h-72"
      table={
        <ChartTable
          caption="Jumlah order per status"
          headers={['Status', 'Order']}
          rows={rows.map((r) => ({ key: r.status, cells: [<StatusBadge key="s" status={r.status} />, formatNumber(r.orders)] }))}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <CartesianGrid horizontal={false} stroke={CHART_GRID} />
          <XAxis
            type="number"
            allowDecimals={false}
            height={44}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Jumlah order', position: 'insideBottom', offset: 4, ...AXIS_TITLE_STYLE }}
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
          <Tooltip cursor={{ fill: 'var(--color-line-soft)' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
          <Legend verticalAlign="top" align="right" iconType="square" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="orders" name="Order" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
