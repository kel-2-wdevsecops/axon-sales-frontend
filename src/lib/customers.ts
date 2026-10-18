import type { CreditSegmentRow, Customers, OfficeRow, SalesRepRow } from '@/types';
import { EMPTY_VALUE, formatNumber, formatUsd } from './format';
import type { SortDirection } from './productSearch';

// Penyajian respons GET /dashboard/customers (F04). Fungsi murni: semua angka
// (penjualan, order, porsi, jumlah customer, rata-rata) dihitung BE; di sini
// hanya pengurutan tabel, keputusan keadaan kosong, dan teks alternatif grafik.
// Tidak ada angka yang dijumlahkan atau dihitung ulang.

/** Nilai yang bisa dibandingkan pada pengurutan tabel; `null` = tidak ada nilai (selalu di bawah). */
export type SortValue = string | number | null;

export interface SortState<K extends string> {
  key: K;
  direction: SortDirection;
}

/**
 * Urutkan baris menurut `sort.key`. Tidak mengubah larik masukan. Teks memakai
 * perbandingan locale Indonesia (tanpa membedakan huruf besar/kecil), nilai
 * `null` selalu di bawah apa pun arahnya, dan baris seri tetap dalam urutan
 * asalnya (urutan BE), jadi hasilnya stabil di setiap render.
 */
export function sortRows<T, K extends string>(
  rows: readonly T[],
  sort: SortState<K>,
  accessors: Record<K, (row: T) => SortValue>,
): T[] {
  const read = accessors[sort.key];
  const factor = sort.direction === 'asc' ? 1 : -1;
  return rows
    .map((row, index) => ({ row, index, value: read(row) }))
    .sort((a, b) => {
      if (a.value === null || b.value === null) {
        return a.value === b.value ? a.index - b.index : a.value === null ? 1 : -1;
      }
      const order =
        typeof a.value === 'string' && typeof b.value === 'string'
          ? a.value.localeCompare(b.value, 'id', { numeric: true, sensitivity: 'base' })
          : Number(a.value) - Number(b.value);
      return order * factor || a.index - b.index;
    })
    .map((entry) => entry.row);
}

/**
 * Urutan berikutnya setelah kolom `key` diklik. Kolom yang sedang aktif
 * dibalik arahnya; kolom baru mulai dari arah yang paling berguna (teks naik
 * A-Z, angka menurun dari terbesar).
 */
export function nextSort<K extends string>(
  current: SortState<K>,
  key: K,
  textKeys: readonly K[],
): SortState<K> {
  if (current.key === key) return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  return { key, direction: textKeys.includes(key) ? 'asc' : 'desc' };
}

/** Teks dari BE yang kosong tampil sebagai `--`, bukan sel kosong. */
export function textOrDash(value: string | null | undefined): string {
  const text = value?.trim();
  return text ? text : EMPTY_VALUE;
}

/**
 * Tidak ada customer sama sekali untuk filter ini (mis. kombinasi benua dan
 * negara tanpa customer): tampilkan keadaan kosong, bukan kartu bernilai 0.
 * Tahun tanpa order BUKAN kosong: customer terdaftar dan prospek tetap berarti.
 */
export function isCustomersEmpty(data: Customers): boolean {
  return data.kpi.customers === 0 && data.kpi.activeCustomers === 0 && data.topCustomers.length === 0;
}

/** Ada minimal satu customer pada segmen credit limit mana pun (donut kosong bila tidak). */
export function hasCreditCustomers(segments: readonly CreditSegmentRow[]): boolean {
  return segments.some((segment) => segment.customers > 0);
}

// ---- Ringkasan teks (ChartCard.summary), dibaca pembaca layar ----

export function summarizeSalesReps(rows: readonly SalesRepRow[]): string {
  if (rows.length === 0) return 'Tidak ada sales rep untuk filter ini.';
  const list = rows
    .map((r) => `${r.name} (${r.office}) penjualan ${formatUsd(r.sales)}, ${formatNumber(r.customers)} customer`)
    .join('; ');
  return `Penjualan per sales rep, dari terbesar: ${list}.`;
}

export function summarizeOffices(rows: readonly OfficeRow[]): string {
  if (rows.length === 0) return 'Tidak ada kantor untuk filter ini.';
  const list = rows
    .map((r) => `${r.city} (${textOrDash(r.territory)}) penjualan ${formatUsd(r.sales)}, ${formatNumber(r.customers)} customer`)
    .join('; ');
  return `Penjualan per kantor, dari terbesar: ${list}.`;
}

export function summarizeCreditSegments(segments: readonly CreditSegmentRow[]): string {
  if (!hasCreditCustomers(segments)) return 'Tidak ada customer untuk filter ini.';
  const list = segments.map((s) => `${s.label} ${formatNumber(s.customers)} customer`).join(', ');
  return `Sebaran customer menurut segmen credit limit: ${list}.`;
}
