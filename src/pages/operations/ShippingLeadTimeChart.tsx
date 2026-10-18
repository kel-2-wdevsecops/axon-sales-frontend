import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, AXIS_TITLE_STYLE, CHART_COLORS, CHART_GRID, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { formatNumber } from '@/lib/format';
import { summarizeLeadTime, type LeadTimeColumn } from '@/lib/operations';

interface ShippingLeadTimeChartProps {
  columns: LeadTimeColumn[];
}

/** Histogram lama pengiriman: jumlah order terkirim per wadah hari (0-2, 3-5, 6-10, lebih dari 10). Wadah dihitung BE. */
export function ShippingLeadTimeChart({ columns }: ShippingLeadTimeChartProps) {
  return (
    <ChartCard
      title="Lama pengiriman"
      description="Hari dari tanggal order sampai tanggal kirim, untuk order yang sudah dikirim."
      summary={summarizeLeadTime(columns)}
      empty={columns.every((c) => c.orders === 0)}
      emptyText="Belum ada order terkirim untuk filter ini."
      chartClassName="h-72"
      table={
        <ChartTable
          caption="Jumlah order terkirim menurut lama pengiriman"
          headers={['Lama pengiriman', 'Order']}
          rows={columns.map((c) => ({ key: c.bucket, cells: [c.label, formatNumber(c.orders)] }))}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={columns} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <CartesianGrid vertical={false} stroke={CHART_GRID} />
          <XAxis
            dataKey="label"
            height={44}
            interval={0}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Lama pengiriman', position: 'insideBottom', offset: 4, ...AXIS_TITLE_STYLE }}
          />
          <YAxis
            width={56}
            allowDecimals={false}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Jumlah order', angle: -90, position: 'insideLeft', ...AXIS_TITLE_STYLE }}
          />
          <Tooltip cursor={{ fill: 'var(--color-line-soft)' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
          <Legend verticalAlign="top" align="right" iconType="square" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="orders" name="Order terkirim" fill={CHART_COLORS[2]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
