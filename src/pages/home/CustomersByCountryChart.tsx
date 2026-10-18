import { useCallback } from 'react';
import { Bar, BarChart, CartesianGrid, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis, type BarShapeProps } from 'recharts';
import { AXIS_TICK, AXIS_TITLE_STYLE, CHART_COLORS, CHART_GRID, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { formatNumber } from '@/lib/format';
import { summarizeCustomersByCountry, type CountryBar } from '@/lib/overviewChart';

interface CustomersByCountryChartProps {
  /** Hasil `groupCustomersByCountry`: top 10 + "Lainnya". */
  bars: CountryBar[];
}

/** Customer terdaftar per negara (bar horizontal, top 10 + "Lainnya"). */
export function CustomersByCountryChart({ bars }: CustomersByCountryChartProps) {
  // "Lainnya" abu-abu agar tidak terbaca sebagai satu negara.
  const renderBar = useCallback(
    (props: BarShapeProps) => <Rectangle {...props} fill={bars[props.index]?.isOthers ? CHART_COLORS[4] : CHART_COLORS[0]} />,
    [bars],
  );

  return (
    <ChartCard
      title="Customer terdaftar per negara"
      description="10 negara teratas; sisanya digabung sebagai Lainnya. Tidak terpengaruh filter waktu."
      summary={summarizeCustomersByCountry(bars)}
      empty={bars.length === 0}
      emptyText="Tidak ada customer terdaftar untuk filter ini."
      chartClassName="h-96"
      table={
        <ChartTable
          caption="Customer terdaftar per negara"
          headers={['Negara', 'Customer']}
          rows={bars.map((b) => ({
            key: b.name,
            cells: [b.isOthers ? `${b.name} (${formatNumber(b.countries)} negara)` : b.name, formatNumber(b.customers)],
          }))}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bars} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }} accessibilityLayer={false}>
          <CartesianGrid horizontal={false} stroke={CHART_GRID} />
          <XAxis
            type="number"
            height={44}
            allowDecimals={false}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Customer terdaftar', position: 'insideBottom', offset: 4, ...AXIS_TITLE_STYLE }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={104}
            interval={0}
            tick={AXIS_TICK}
            stroke={CHART_GRID}
            label={{ value: 'Negara', angle: -90, position: 'insideLeft', ...AXIS_TITLE_STYLE }}
          />
          <Tooltip
            cursor={{ fill: 'var(--color-line-soft)' }}
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, _name, item) => {
              const bar = item.payload as CountryBar | undefined;
              const label = bar?.isOthers ? `Lainnya (${formatNumber(bar.countries)} negara)` : 'Customer terdaftar';
              return [formatNumber(Number(value)), label];
            }}
          />
          <Bar dataKey="customers" name="Customer terdaftar" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} shape={renderBar} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
