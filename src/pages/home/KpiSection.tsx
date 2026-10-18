import { KpiCard } from '@/components/ui/KpiCard';
import { formatNumber, formatPercent, formatUsd, formatUsdCompact } from '@/lib/format';
import type { Overview } from '@/types';

interface KpiSectionProps {
  kpi: Overview['kpi'];
  /** Penanda periode parsial untuk angka yang bergantung pada waktu (mis. "Termasuk 2005 (Jan-Mei)"). */
  partialLabel?: string;
}

/** Enam kartu KPI. Nilai berasal dari BE apa adanya; di sini hanya diformat. */
export function KpiSection({ kpi, partialLabel }: KpiSectionProps) {
  return (
    <section aria-label="Indikator utama" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <KpiCard label="Penjualan" value={formatUsdCompact(kpi.sales)} fullValue={formatUsd(kpi.sales)} partialLabel={partialLabel} />
      <KpiCard label="Profit" value={formatUsdCompact(kpi.profit)} fullValue={formatUsd(kpi.profit)} partialLabel={partialLabel} />
      <KpiCard
        label="Margin profit"
        value={formatPercent(kpi.profitMarginPct)}
        note={kpi.profitMarginPct === null ? 'Tidak ada penjualan' : undefined}
      />
      <KpiCard label="Order" value={formatNumber(kpi.orders)} partialLabel={partialLabel} />
      <KpiCard
        label="Customer terdaftar"
        value={formatNumber(kpi.customers)}
        note={`${formatNumber(kpi.activeCustomers)} aktif`}
      />
      <KpiCard label="Karyawan" value={formatNumber(kpi.employees)} note="Seluruh karyawan" />
    </section>
  );
}
