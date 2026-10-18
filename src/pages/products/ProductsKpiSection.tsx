import { KpiCard } from '@/components/ui/KpiCard';
import { formatNumber, formatPercent, formatUsd, formatUsdCompact } from '@/lib/format';
import type { Products } from '@/types';

interface ProductsKpiSectionProps {
  kpi: Products['kpi'];
}

/**
 * Lima kartu KPI. Nilai berasal dari BE apa adanya; di sini hanya diformat.
 * Penjualan dan profit tampil ringkas di nilai utama dan penuh (id-ID) di
 * keterangan, jadi angka lengkap terbaca tanpa perlu mengarahkan kursor.
 */
export function ProductsKpiSection({ kpi }: ProductsKpiSectionProps) {
  return (
    <section aria-label="Indikator utama" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <KpiCard label="Penjualan" value={formatUsdCompact(kpi.sales)} fullValue={formatUsd(kpi.sales)} note={formatUsd(kpi.sales)} />
      <KpiCard label="Profit" value={formatUsdCompact(kpi.profit)} fullValue={formatUsd(kpi.profit)} note={formatUsd(kpi.profit)} />
      <KpiCard
        label="Margin profit"
        value={formatPercent(kpi.profitMarginPct)}
        note={kpi.profitMarginPct === null ? 'Tidak ada penjualan' : undefined}
      />
      <KpiCard label="Order" value={formatNumber(kpi.orders)} note="Order berbeda" />
      <KpiCard label="Kuantitas terjual" value={formatNumber(kpi.quantity)} note="Unit" />
    </section>
  );
}
