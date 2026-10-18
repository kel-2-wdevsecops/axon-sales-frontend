import type { FilterOptions, Products } from '@/types';
import { formatMonth, formatMonthShort, formatNumber, formatUsd } from './format';
import { partialYearLabeler } from './overviewChart';

// Olah respons GET /dashboard/products menjadi data grafik dan teks alternatifnya
// (F02). Fungsi murni: angka dari BE tidak dihitung ulang. Khususnya jumlah
// order antar product line TIDAK dijumlahkan di sini (satu order bisa memuat
// beberapa product line); hanya KPI `orders` dari BE yang dianggap total.

export interface MonthColumn {
  month: number;
  /** Singkatan untuk sumbu: `Jan`, `Mei`, `Agu`. */
  label: string;
  /** Nama lengkap untuk tabel dan tooltip: `Januari`. */
  fullLabel: string;
  orders: number;
}

/**
 * Order per bulan dalam urutan kalender Januari-Desember. BE selalu
 * mengirim 12 baris; bulan yang hilang tetap ditampilkan sebagai 0 supaya
 * sumbu tidak bolong. Tidak ada penjumlahan: bulan ganda memakai baris terakhir.
 */
export function toMonthColumns(rows: Products['ordersByMonth']): MonthColumn[] {
  const byMonth = new Map(rows.map((row) => [row.month, row.orders]));
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: formatMonthShort(i + 1),
    fullLabel: formatMonth(i + 1),
    orders: byMonth.get(i + 1) ?? 0,
  }));
}

export interface YearOrderColumn {
  year: number;
  /** Label sumbu: `2004`, atau `2005 (Jan-Mei)` untuk tahun yang datanya belum lengkap. */
  label: string;
  orders: number;
}

/** Order per tahun, urut tahun naik; tahun parsial diberi keterangan periodenya (dari rentang data BE). */
export function toYearOrderColumns(
  rows: Products['ordersByYear'],
  range: FilterOptions['dataRange'] | undefined,
): YearOrderColumn[] {
  const partialLabelOf = partialYearLabeler(range);
  return [...rows]
    .sort((a, b) => a.year - b.year)
    .map((row) => ({ year: row.year, label: partialLabelOf(row.year) ?? String(row.year), orders: row.orders }));
}

/** Potong label sumbu yang terlalu panjang dengan elipsis; nama lengkap tetap tampil di tooltip dan tabel. */
export function truncateLabel(text: string, max = 18): string {
  const limit = Math.max(2, Math.floor(max));
  const chars = [...text];
  return chars.length <= limit ? text : `${chars.slice(0, limit - 1).join('').trimEnd()}…`;
}

/** Tidak ada produk dan tidak ada order untuk filter ini: tampilkan keadaan kosong, bukan angka nol. */
export function isProductsEmpty(data: Products): boolean {
  return data.products.length === 0 && data.kpi.orders === 0 && data.salesByProductLine.length === 0;
}

/** Tidak ada order sama sekali: grafik berbasis order dan penjualan kosong (tabel produk tetap memuat produk). */
export function hasNoOrders(data: Products): boolean {
  return data.kpi.orders === 0;
}

// ---- Ringkasan teks (ChartCard.summary), dibaca pembaca layar ----

export function summarizeSalesByProductLine(rows: Products['salesByProductLine']): string {
  if (rows.length === 0) return 'Tidak ada penjualan untuk filter ini.';
  const list = rows.map((r) => `${r.productLine} penjualan ${formatUsd(r.sales)}, profit ${formatUsd(r.profit)}`).join('; ');
  return `Penjualan dan profit per product line, dari terbesar: ${list}.`;
}

export function summarizeOrdersByYear(columns: readonly YearOrderColumn[]): string {
  if (columns.length === 0) return 'Tidak ada order untuk filter ini.';
  return `Order per tahun: ${columns.map((c) => `${c.label} ${formatNumber(c.orders)}`).join(', ')}.`;
}

export function summarizeOrdersByMonth(columns: readonly MonthColumn[]): string {
  const peak = columns.reduce<MonthColumn | undefined>((best, c) => (best === undefined || c.orders > best.orders ? c : best), undefined);
  if (!peak || peak.orders === 0) return 'Tidak ada order untuk filter ini.';
  const list = columns.map((c) => `${c.fullLabel} ${formatNumber(c.orders)}`).join(', ');
  return `Order per bulan, Januari sampai Desember: ${list}. Paling ramai ${peak.fullLabel} dengan ${formatNumber(peak.orders)} order.`;
}

export function summarizeTopVendors(rows: Products['topVendors']): string {
  if (rows.length === 0) return 'Tidak ada penjualan untuk filter ini.';
  const list = rows.map((r) => `${r.vendor} ${formatUsd(r.sales)}`).join(', ');
  return `${formatNumber(rows.length)} vendor teratas menurut penjualan: ${list}.`;
}
