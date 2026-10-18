import { KpiCard } from '@/components/ui/KpiCard';
import { formatNumber, formatUsd } from '@/lib/format';
import type { Customers } from '@/types';

interface CustomersKpiSectionProps {
  kpi: Customers['kpi'];
}

/**
 * Lima kartu KPI. Nilai berasal dari BE apa adanya; di sini hanya diformat.
 * Tiap catatan menyebut apakah angkanya ikut filter tahun, supaya pengguna
 * tidak bingung saat sebagian angka tidak berubah ketika tahun diganti.
 */
export function CustomersKpiSection({ kpi }: CustomersKpiSectionProps) {
  return (
    <section aria-label="Indikator utama" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <KpiCard label="Customer terdaftar" value={formatNumber(kpi.customers)} note="Tidak terpengaruh filter tahun" />
      <KpiCard label="Customer aktif" value={formatNumber(kpi.activeCustomers)} note="Punya order; ikut filter tahun" />
      <KpiCard label="Prospek (belum order)" value={formatNumber(kpi.prospects)} note="Belum pernah order; tidak ikut filter tahun" />
      <KpiCard label="Tanpa sales rep" value={formatNumber(kpi.withoutSalesRep)} note="Tidak terpengaruh filter tahun" />
      <KpiCard
        label="Rata-rata nilai order"
        value={formatUsd(kpi.avgOrderValue)}
        note={kpi.avgOrderValue === null ? 'Tidak ada order' : 'Per order; ikut filter tahun'}
      />
    </section>
  );
}
