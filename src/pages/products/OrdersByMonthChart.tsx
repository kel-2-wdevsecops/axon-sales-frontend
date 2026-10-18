import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, AXIS_TITLE_STYLE, CHART_COLORS, CHART_GRID, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { formatNumber } from '@/lib/format';
import { summarizeOrdersByMonth, type MonthColumn } from '@/lib/productsChart';

interface OrdersByMonthChartProps {
  /** 12 kolom Januari-Desember (hasil `toMonthColumns`). */
  columns: MonthColumn[];
}

/** Order per bulan (area), urutan kalender; akumulasi semua tahun dalam filter. */
export function OrdersByMonthChart({ columns }: OrdersByMonthChartProps) {
  const noOrders = columns.every((c) => c.orders === 0);

  return (
    <ChartCard
      title="Order per bulan"
      description="Akumulasi semua tahun dalam filter, urut Januari sampai Desember."
      summary={summarizeOrdersByMonth(columns)}
      empty={noOrders}
      emptyText="Tidak ada order untuk filter ini."
      table={
        <ChartTable
          caption="Order per bulan"
          headers={['Bulan', 'Order']}
          rows={columns.map((c) => ({ key: String(c.month), cells: [c.fullLabel, formatNumber(c.orders)] }))}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={columns} margin={{ top: 4, right: 12, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <CartesianGrid vertical={false} stroke={CHART_GRID} />
          <XAxis
            dataKey="label"
            height={44}
            interval={0}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Bulan', position: 'insideBottom', offset: 4, ...AXIS_TITLE_STYLE }}
          />
          <YAxis
            width={56}
            allowDecimals={false}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Jumlah order', angle: -90, position: 'insideLeft', ...AXIS_TITLE_STYLE }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
          <Area
            type="monotone"
            dataKey="orders"
            name="Order"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            fill={CHART_COLORS[0]}
            fillOpacity={0.18}
            dot={{ r: 3, fill: CHART_COLORS[0], stroke: CHART_COLORS[0] }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
