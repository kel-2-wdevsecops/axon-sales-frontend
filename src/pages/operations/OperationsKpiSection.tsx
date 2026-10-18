import { KpiCard } from '@/components/ui/KpiCard';
import { formatNumber } from '@/lib/format';
import { describeAsOf, formatDays } from '@/lib/operations';
import type { Operations } from '@/types';

interface OperationsKpiSectionProps {
  kpi: Operations['kpi'];
  /** Tanggal order terakhir di data; menjadi keterangan "per ..." pada KPI lewat tenggat. */
  asOf: string | null;
}

/**
 * Enam kartu KPI. Nilai berasal dari BE apa adanya (termasuk lewat tenggat,
 * terlambat kirim, dan rata-rata hari kirim); di sini hanya diformat.
 * "Lewat tenggat" dihitung terhadap tanggal data terakhir, bukan hari ini,
 * jadi tanggalnya selalu ditampilkan.
 */
export function OperationsKpiSection({ kpi, asOf }: OperationsKpiSectionProps) {
  const asOfText = describeAsOf(asOf);

  return (
    <section aria-label="Indikator utama" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <KpiCard label="Order" value={formatNumber(kpi.orders)} />
      <KpiCard label="Terkirim" value={formatNumber(kpi.shipped)} note="Status Shipped" />
      <KpiCard label="Perlu perhatian" value={formatNumber(kpi.needsAttention)} note="On Hold, Disputed, In Process" />
      <KpiCard
        label="Lewat tenggat"
        value={formatNumber(kpi.overdue)}
        note={asOfText ? `Belum dikirim, ${asOfText}` : 'Belum dikirim'}
      />
      <KpiCard label="Terlambat dikirim" value={formatNumber(kpi.lateShipments)} note="Dikirim setelah tenggat" />
      <KpiCard
        label="Rata-rata hari kirim"
        value={formatDays(kpi.avgShipDays)}
        note={kpi.avgShipDays === null ? 'Belum ada pengiriman' : 'Dari tanggal order'}
      />
    </section>
  );
}
