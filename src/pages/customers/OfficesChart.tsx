import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, AXIS_TITLE_STYLE, CHART_COLORS, CHART_GRID, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { summarizeOffices, textOrDash } from '@/lib/customers';
import { formatCompact, formatNumber, formatUsd } from '@/lib/format';
import type { OfficeRow } from '@/types';

interface OfficesChartProps {
  rows: OfficeRow[];
}

/** Penjualan per kantor (kolom, urutan BE: terbesar di kiri). Territory dan jumlah customer ada di tabel alternatif. */
export function OfficesChart({ rows }: OfficesChartProps) {
  return (
    <ChartCard
      title="Penjualan per kantor"
      description="Dihitung dari customer yang dipegang sales rep tiap kantor saat ini. Semua kantor tampil."
      summary={summarizeOffices(rows)}
      empty={rows.length === 0}
      emptyText="Tidak ada kantor untuk filter ini."
      chartClassName="h-72"
      table={
        <ChartTable
          caption="Penjualan per kantor"
          headers={['Kantor', 'Territory', 'Penjualan', 'Customer']}
          rows={rows.map((r) => ({
            key: r.officeCode,
            cells: [r.city, textOrDash(r.territory), formatUsd(r.sales), formatNumber(r.customers)],
          }))}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <CartesianGrid vertical={false} stroke={CHART_GRID} />
          <XAxis
            dataKey="city"
            height={52}
            interval={0}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Kantor (kota)', position: 'insideBottom', offset: 0, ...AXIS_TITLE_STYLE }}
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
