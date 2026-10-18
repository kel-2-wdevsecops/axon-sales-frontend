import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_TICK, AXIS_TITLE_STYLE, CHART_COLORS, CHART_GRID, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { formatCompact, formatUsd } from '@/lib/format';
import { summarizeTopCountries } from '@/lib/overviewChart';
import type { Overview } from '@/types';
import { FilterButton } from './FilterButton';

interface TopCountriesChartProps {
  rows: Overview['topCountriesBySales'];
  onSelectCountry: (country: string) => void;
}

/** Top 5 negara menurut penjualan (bar horizontal). Klik batang = saring ke negara itu. */
export function TopCountriesChart({ rows, onSelectCountry }: TopCountriesChartProps) {
  return (
    <ChartCard
      title="5 negara dengan penjualan terbesar"
      description="Klik batang untuk menyaring ke negara itu."
      summary={summarizeTopCountries(rows)}
      empty={rows.length === 0}
      emptyText="Tidak ada penjualan untuk filter ini."
      table={
        <ChartTable
          caption="5 negara dengan penjualan terbesar"
          headers={['Negara', 'Penjualan']}
          rows={rows.map((r) => ({
            key: r.country,
            cells: [<FilterButton key="n" label={r.country} onSelect={() => onSelectCountry(r.country)} />, formatUsd(r.sales)],
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
            label={{ value: 'Penjualan (US$)', position: 'insideBottom', offset: 4, ...AXIS_TITLE_STYLE }}
          />
          <YAxis
            type="category"
            dataKey="country"
            width={104}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Negara', angle: -90, position: 'insideLeft', ...AXIS_TITLE_STYLE }}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-line-soft)' }}
            contentStyle={TOOLTIP_STYLE}
            formatter={(value) => formatUsd(Number(value))}
          />
          <Bar
            dataKey="sales"
            name="Penjualan"
            fill={CHART_COLORS[0]}
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            onClick={(_item, index) => {
              const row = rows[index];
              if (row) onSelectCountry(row.country);
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
