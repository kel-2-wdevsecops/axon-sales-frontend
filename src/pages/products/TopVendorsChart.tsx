import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, AXIS_TITLE_STYLE, CHART_COLORS, CHART_GRID, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { formatCompact, formatUsd } from '@/lib/format';
import { summarizeTopVendors, truncateLabel } from '@/lib/productsChart';
import type { Products } from '@/types';

interface TopVendorsChartProps {
  rows: Products['topVendors'];
}

/** 5 vendor dengan penjualan terbesar (kolom). Nama vendor panjang dipotong di sumbu; nama lengkap ada di tooltip dan tabel. */
export function TopVendorsChart({ rows }: TopVendorsChartProps) {
  return (
    <ChartCard
      title="5 vendor dengan penjualan terbesar"
      summary={summarizeTopVendors(rows)}
      empty={rows.length === 0}
      emptyText="Tidak ada penjualan untuk filter ini."
      chartClassName="h-72"
      table={
        <ChartTable
          caption="5 vendor dengan penjualan terbesar"
          headers={['Vendor', 'Penjualan']}
          rows={rows.map((r) => ({ key: r.vendor, cells: [r.vendor, formatUsd(r.sales)] }))}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <CartesianGrid vertical={false} stroke={CHART_GRID} />
          <XAxis
            dataKey="vendor"
            height={96}
            interval={0}
            angle={-30}
            tick={{ ...AXIS_TICK, textAnchor: 'end' }}
            tickFormatter={(v: string) => truncateLabel(v)}
            stroke={CHART_GRID}
            label={{ value: 'Vendor', position: 'insideBottom', offset: 0, ...AXIS_TITLE_STYLE }}
          />
          <YAxis
            width={72}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            tickFormatter={(v: number) => formatCompact(v)}
            label={{ value: 'Penjualan (US$)', angle: -90, position: 'insideLeft', ...AXIS_TITLE_STYLE }}
          />
          <Tooltip cursor={{ fill: 'var(--color-line-soft)' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => formatUsd(Number(value))} />
          <Bar dataKey="sales" name="Penjualan" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
