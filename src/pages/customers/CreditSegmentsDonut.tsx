import { useMemo } from 'react';
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS, TOOLTIP_STYLE } from '@/components/charts/chartTheme';
import { ChartCard } from '@/components/ui/ChartCard';
import { ChartTable } from '@/components/ui/ChartTable';
import { hasCreditCustomers, summarizeCreditSegments } from '@/lib/customers';
import { formatNumber } from '@/lib/format';
import type { CreditSegmentKey, CreditSegmentRow } from '@/types';

interface CreditSegmentsDonutProps {
  rows: CreditSegmentRow[];
}

// Warna tetap per segmen (bukan per urutan) supaya segmen yang sama selalu berwarna sama.
const SEGMENT_COLORS: Record<CreditSegmentKey, string> = {
  none: CHART_COLORS[4],
  low: CHART_COLORS[2],
  medium: CHART_COLORS[0],
  high: CHART_COLORS[1],
};

/**
 * Sebaran customer menurut segmen credit limit (donut, agregat 4 segmen). Label
 * segmen dari BE. Warna irisan dan legenda berasal dari satu field `fill` pada
 * data, jadi selalu sama; makna tidak hanya lewat warna (legenda memuat label
 * dan jumlah, tabel alternatif tersedia).
 */
export function CreditSegmentsDonut({ rows }: CreditSegmentsDonutProps) {
  const slices = useMemo(() => rows.map((row) => ({ ...row, fill: SEGMENT_COLORS[row.segment] })), [rows]);
  const countOf = useMemo(() => new Map(rows.map((r) => [r.label, r.customers])), [rows]);

  return (
    <ChartCard
      title="Segmen credit limit customer"
      description="Hanya jumlah customer per segmen; credit limit per customer tidak ditampilkan. Tidak berubah saat tahun diganti."
      summary={summarizeCreditSegments(rows)}
      empty={!hasCreditCustomers(rows)}
      emptyText="Tidak ada customer untuk filter ini."
      chartClassName="h-72"
      table={
        <ChartTable
          caption="Customer per segmen credit limit"
          headers={['Segmen', 'Customer']}
          rows={rows.map((r) => ({ key: r.segment, cells: [r.label, formatNumber(r.customers)] }))}
        />
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart accessibilityLayer={false}>
          <Pie
            data={slices}
            dataKey="customers"
            nameKey="label"
            cx="50%"
            cy="44%"
            innerRadius="52%"
            outerRadius="78%"
            paddingAngle={2}
            rootTabIndex={-1}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => `${formatNumber(Number(value))} customer`} />
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
