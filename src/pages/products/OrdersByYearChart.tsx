import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, AXIS_TITLE_STYLE, CHART_COLORS, CHART_GRID, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { formatNumber } from '@/lib/format';
import { summarizeOrdersByYear, type YearOrderColumn } from '@/lib/productsChart';

interface OrdersByYearChartProps {
  columns: YearOrderColumn[];
  /** Ada tahun yang datanya belum lengkap (diberi keterangan periodenya di sumbu). */
  hasPartial: boolean;
}

/** Jumlah order per tahun (kolom). Order dihitung BE per tahun; tidak dijumlahkan ulang di sini. */
export function OrdersByYearChart({ columns, hasPartial }: OrdersByYearChartProps) {
  return (
    <ChartCard
      title="Order per tahun"
      description={hasPartial ? 'Tahun yang belum lengkap diberi keterangan periodenya.' : undefined}
      summary={summarizeOrdersByYear(columns)}
      empty={columns.length === 0}
      emptyText="Tidak ada order untuk filter ini."
      table={
        <ChartTable
          caption="Order per tahun"
          headers={['Tahun', 'Order']}
          rows={columns.map((c) => ({ key: String(c.year), cells: [c.label, formatNumber(c.orders)] }))}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={columns} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <CartesianGrid vertical={false} stroke={CHART_GRID} />
          <XAxis
            dataKey="label"
            height={44}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Tahun', position: 'insideBottom', offset: 4, ...AXIS_TITLE_STYLE }}
          />
          <YAxis
            width={56}
            allowDecimals={false}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Jumlah order', angle: -90, position: 'insideLeft', ...AXIS_TITLE_STYLE }}
          />
          <Tooltip cursor={{ fill: 'var(--color-line-soft)' }} contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
          <Bar dataKey="orders" name="Order" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
