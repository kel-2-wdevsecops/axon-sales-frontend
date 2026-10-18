import { useMemo } from 'react';
import { Legend, Pie, PieChart, ResponsiveContainer, Sector, Tooltip, type PieSectorShapeProps } from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { formatNumber } from '@/lib/format';
import { summarizeContinents } from '@/lib/overviewChart';
import type { Overview } from '@/types';
import { FilterButton } from './FilterButton';

interface ContinentDonutProps {
  rows: Overview['customersByContinent'];
  onSelectContinent: (continent: string) => void;
}

function renderSlice(props: PieSectorShapeProps) {
  return <Sector {...props} fill={CHART_COLORS[props.index % CHART_COLORS.length]} />;
}

/** Customer terdaftar per benua (donut). Klik irisan = saring ke benua itu. */
export function ContinentDonut({ rows, onSelectContinent }: ContinentDonutProps) {
  const countOf = useMemo(() => new Map(rows.map((r) => [r.continent, r.customers])), [rows]);

  return (
    <ChartCard
      title="Customer terdaftar per benua"
      description="Tidak terpengaruh filter waktu. Klik irisan untuk menyaring ke benua itu."
      summary={summarizeContinents(rows)}
      empty={rows.length === 0}
      emptyText="Tidak ada customer terdaftar untuk filter ini."
      chartClassName="h-72"
      table={
        <ChartTable
          caption="Customer terdaftar per benua"
          headers={['Benua', 'Customer']}
          rows={rows.map((r) => ({
            key: r.continent,
            cells: [<FilterButton key="n" label={r.continent} onSelect={() => onSelectContinent(r.continent)} />, formatNumber(r.customers)],
          }))}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart accessibilityLayer={false}>
          <Pie
            data={rows}
            dataKey="customers"
            nameKey="continent"
            cx="50%"
            cy="44%"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
            rootTabIndex={-1}
            shape={renderSlice}
            cursor="pointer"
            onClick={(_item, index) => {
              const row = rows[index];
              if (row) onSelectContinent(row.continent);
            }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => formatNumber(Number(value))} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => `${String(value)} (${formatNumber(countOf.get(String(value)))})`}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
