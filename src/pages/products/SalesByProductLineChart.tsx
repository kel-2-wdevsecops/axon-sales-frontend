import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, AXIS_TITLE_STYLE, CHART_COLORS, CHART_GRID, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { formatCompact, formatUsd } from '@/lib/format';
import { summarizeSalesByProductLine } from '@/lib/productsChart';
import type { Products } from '@/types';
import { LineToggleButton } from './LineToggleButton';

interface SalesByProductLineChartProps {
  rows: Products['salesByProductLine'];
  /** Product line yang sedang ada di filter (untuk tanda di tabel alternatif). */
  selected: readonly string[];
  onToggleLine: (productLine: string) => void;
}

/** Penjualan dan profit per product line (bar horizontal). Klik batang = tambah/hapus product line dari filter. */
export function SalesByProductLineChart({ rows, selected, onToggleLine }: SalesByProductLineChartProps) {
  const onBarClick = (_item: unknown, index: number) => {
    const row = rows[index];
    if (row) onToggleLine(row.productLine);
  };

  return (
    <ChartCard
      title="Penjualan dan profit per product line"
      description="Klik batang untuk menambah atau menghapus product line dari filter."
      summary={summarizeSalesByProductLine(rows)}
      empty={rows.length === 0}
      emptyText="Tidak ada penjualan untuk filter ini."
      chartClassName="h-96"
      table={
        <ChartTable
          caption="Penjualan dan profit per product line"
          headers={['Product line', 'Penjualan', 'Profit']}
          rows={rows.map((r) => ({
            key: r.productLine,
            cells: [
              <LineToggleButton key="n" label={r.productLine} pressed={selected.includes(r.productLine)} onToggle={() => onToggleLine(r.productLine)} />,
              formatUsd(r.sales),
              formatUsd(r.profit),
            ],
          }))}
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
            label={{ value: 'Nilai (US$)', position: 'insideBottom', offset: 4, ...AXIS_TITLE_STYLE }}
          />
          <YAxis
            type="category"
            dataKey="productLine"
            width={124}
            interval={0}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Product line', angle: -90, position: 'insideLeft', ...AXIS_TITLE_STYLE }}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-line-soft)' }}
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => formatUsd(Number(value))}
          />
          <Legend verticalAlign="top" align="right" iconType="square" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="sales" name="Penjualan" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} cursor="pointer" onClick={onBarClick} />
          <Bar dataKey="profit" name="Profit" fill={CHART_COLORS[1]} radius={[0, 4, 4, 0]} cursor="pointer" onClick={onBarClick} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
