import type { Operations, ShippingBucket } from '@/types';
import { EMPTY_VALUE, formatNumber, formatUsd } from './format';
import { formatIsoDate } from './period';

// Penyajian respons GET /dashboard/operations (F05). Fungsi murni: jumlah,
// penjualan, rata-rata, dan isi daftar order dihitung BE; di sini hanya
// format, label, pemotongan teks, dan teks alternatif grafik. Tidak ada
// angka yang dihitung ulang.

// ---- Catatan order ----

/** Batas karakter catatan order di tampilan (PRD §13: BE mengirim catatan apa adanya). */
export const ORDER_NOTE_MAX = 160;

const ELLIPSIS = '\u2026';

export interface OrderNote {
  /** Teks tampil: utuh, atau 160 karakter pertama + elipsis. */
  text: string;
  /** Teks lengkap (spasi dirapikan), untuk `title` dan pembaca layar. */
  full: string;
  truncated: boolean;
}

/**
 * Catatan order untuk sel tabel. Spasi/baris baru beruntun dirapatkan jadi satu
 * spasi. Pemotongan dihitung per code point (bukan per UTF-16 unit), jadi emoji
 * dan karakter di luar BMP tidak pernah terbelah menjadi surrogate yatim.
 * Elipsis ditambahkan SETELAH `max` karakter. null/kosong/hanya spasi -> null.
 *
 * Hasilnya tetap teks mentah: pemanggil harus merendernya sebagai child teks
 * (React meloloskannya), bukan HTML.
 */
export function toOrderNote(comments: string | null | undefined, max = ORDER_NOTE_MAX): OrderNote | null {
  if (typeof comments !== 'string') return null;
  const full = comments.replace(/\s+/g, ' ').trim();
  if (full === '') return null;

  const limit = Number.isFinite(max) ? Math.max(1, Math.floor(max)) : ORDER_NOTE_MAX;
  const chars = [...full];
  if (chars.length <= limit) return { text: full, full, truncated: false };
  return { text: `${chars.slice(0, limit).join('').trimEnd()}${ELLIPSIS}`, full, truncated: true };
}

// ---- Status order ----

export type StatusTone = 'attention' | 'positive' | 'negative' | 'neutral';

/**
 * Nada visual status. Hanya penentu gaya: daftar order perlu perhatian
 * ditentukan BE. Status tak dikenal -> netral. Penanda selalu berpasangan
 * dengan teks status (bukan warna saja).
 */
export function statusTone(status: string): StatusTone {
  switch (status) {
    case 'On Hold':
    case 'Disputed':
    case 'In Process':
      return 'attention';
    case 'Shipped':
    case 'Resolved':
      return 'positive';
    case 'Cancelled':
      return 'negative';
    default:
      return 'neutral';
  }
}

// ---- Tanggal, hari, dan keterangan ----

/** Tanggal order untuk tabel: `19 November 2004`; kosong/tidak valid -> `--`. */
export function formatOrderDate(value: string | null | undefined): string {
  return formatIsoDate(value ?? null) ?? EMPTY_VALUE;
}

/** Keterangan "per {asOf}": `per 31 Mei 2005`; null/tidak valid -> null (jangan menampilkan tanggal hari ini). */
export function describeAsOf(asOf: string | null): string | null {
  const date = formatIsoDate(asOf);
  return date ? `per ${date}` : null;
}

/** Jumlah hari: `65 hari`, `3,76 hari` (dua desimal hanya bila tidak bulat); null/bukan angka -> `--`. */
export function formatDays(days: number | null | undefined): string {
  if (typeof days !== 'number' || !Number.isFinite(days)) return EMPTY_VALUE;
  return `${formatNumber(days, Number.isInteger(days) ? 0 : 2)} hari`;
}

// ---- Lama pengiriman ----

/** Urutan tetap wadah lama pengiriman. */
export const LEAD_TIME_BUCKETS = ['0-2', '3-5', '6-10', '>10'] as const satisfies readonly ShippingBucket[];

const BUCKET_LABELS: Record<ShippingBucket, string> = {
  '0-2': '0-2 hari',
  '3-5': '3-5 hari',
  '6-10': '6-10 hari',
  '>10': 'Lebih dari 10 hari',
};

export interface LeadTimeColumn {
  bucket: ShippingBucket;
  label: string;
  orders: number;
}

/**
 * Empat wadah lama pengiriman dalam urutan tetap (0-2, 3-5, 6-10, >10).
 * Wadah yang tidak dikirim BE tampil 0 supaya sumbu tidak bolong; wadah
 * di luar keempatnya diabaikan. Tidak ada penjumlahan.
 */
export function toLeadTimeColumns(rows: Operations['shippingLeadTime']): LeadTimeColumn[] {
  const byBucket = new Map<string, number>(rows.map((row) => [row.bucket, row.orders]));
  return LEAD_TIME_BUCKETS.map((bucket) => ({ bucket, label: BUCKET_LABELS[bucket], orders: byBucket.get(bucket) ?? 0 }));
}

// ---- Keadaan kosong ----

/**
 * Tidak ada order sama sekali untuk filter ini: tampilkan keadaan kosong, bukan
 * angka nol dan grafik kosong. `kpi.orders` hanya mengikuti filter tahun; filter
 * status yang tidak cocok mengosongkan rincian status dan daftar, bukan halaman.
 */
export function isOperationsEmpty(data: Operations): boolean {
  return (
    data.kpi.orders === 0 &&
    data.statusBreakdown.length === 0 &&
    data.attentionOrders.length === 0 &&
    data.shippingLeadTime.every((row) => row.orders === 0) &&
    data.slowestShipments.length === 0
  );
}

// ---- Ringkasan teks (ChartCard.summary), dibaca pembaca layar ----

export function summarizeOrdersByStatus(rows: Operations['statusBreakdown']): string {
  if (rows.length === 0) return 'Tidak ada order untuk filter ini.';
  const list = rows.map((r) => `${r.status} ${formatNumber(r.orders)}`).join(', ');
  return `Jumlah order per status, dari penjualan terbesar: ${list}.`;
}

export function summarizeSalesByStatus(rows: Operations['statusBreakdown']): string {
  if (rows.length === 0) return 'Tidak ada penjualan untuk filter ini.';
  const list = rows.map((r) => `${r.status} ${formatUsd(r.sales)}`).join(', ');
  return `Penjualan per status, dari terbesar: ${list}.`;
}

export function summarizeLeadTime(columns: readonly LeadTimeColumn[]): string {
  if (columns.every((c) => c.orders === 0)) return 'Belum ada order terkirim untuk filter ini.';
  const list = columns.map((c) => `${c.label} ${formatNumber(c.orders)} order`).join(', ');
  return `Jumlah order terkirim menurut lama pengiriman: ${list}.`;
}
