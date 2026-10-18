import type { FilterOptions, Overview } from '@/types';
import { formatNumber, formatUsd } from './format';
import { partialPeriods, type PartialPeriod } from './period';

// Olah respons GET /dashboard/overview menjadi data grafik dan teks alternatifnya
// (F01). Fungsi murni: angka dari BE tidak dihitung ulang. Satu-satunya
// penjumlahan di sini adalah baris "Lainnya", yang memang tugas FE (dokumen F01).

export const OTHERS_LABEL = 'Lainnya';
/** Jumlah negara yang ditampilkan sendiri pada grafik customer per negara. */
export const TOP_COUNTRY_LIMIT = 10;

export interface CountryBar {
  name: string;
  customers: number;
  /** Baris gabungan "Lainnya"; bukan satu negara. */
  isOthers: boolean;
  /** Jumlah negara yang diwakili: 1 untuk negara biasa. */
  countries: number;
}

/**
 * Top `limit` negara menurut customer terdaftar, sisanya digabung menjadi satu
 * baris "Lainnya" (pie 27 irisan tidak terbaca). Urut customer menurun lalu
 * nama. Bila sisanya hanya satu negara, negara itu ditampilkan sendiri:
 * "Lainnya (1 negara)" tidak menambah informasi.
 */
export function groupCustomersByCountry(rows: Overview['customersByCountry'], limit = TOP_COUNTRY_LIMIT): CountryBar[] {
  const top = Math.max(1, Math.floor(limit));
  const bars = [...rows]
    .sort((a, b) => b.customers - a.customers || a.country.localeCompare(b.country))
    .map<CountryBar>((row) => ({ name: row.country, customers: row.customers, isOthers: false, countries: 1 }));
  if (bars.length <= top + 1) return bars;

  const rest = bars.slice(top);
  const others: CountryBar = {
    name: OTHERS_LABEL,
    customers: rest.reduce((sum, bar) => sum + bar.customers, 0),
    isOthers: true,
    countries: rest.length,
  };
  return [...bars.slice(0, top), others];
}

export interface YearColumn {
  year: number;
  /** Label sumbu: `2004`, atau `2005 (Jan-Mei)` untuk tahun parsial. */
  label: string;
  sales: number;
  profit: number;
  isPartial: boolean;
}

/** Label tahun parsial dari rentang data BE (`2005 (Jan-Mei)`); undefined bila bukan tahun parsial. */
export function partialYearLabeler(range: FilterOptions['dataRange'] | undefined): (year: number) => string | undefined {
  const periods = range ? partialPeriods(range).filter((p) => p.kind === 'year') : [];
  return (year) => periods.find((p) => p.year === year)?.label;
}

/**
 * Penjualan dan profit per tahun, urut tahun naik. `partialLabelOf` memberi
 * label tahun parsial; tanpa itu (rentang data belum termuat) dipakai "(parsial)".
 */
export function toYearColumns(
  rows: Overview['salesByYear'],
  partialLabelOf: (year: number) => string | undefined = () => undefined,
): YearColumn[] {
  return [...rows]
    .sort((a, b) => a.year - b.year)
    .map((row) => ({
      year: row.year,
      label: row.isPartial ? (partialLabelOf(row.year) ?? `${row.year} (parsial)`) : String(row.year),
      sales: row.sales,
      profit: row.profit,
      isPartial: row.isPartial,
    }));
}

/** Penanda untuk kartu KPI penjualan: periode parsial pertama yang ikut dalam tampilan, mis. `Termasuk 2005 (Jan-Mei)`. */
export function partialKpiLabel(periods: readonly PartialPeriod[]): string | undefined {
  const first = periods[0];
  return first ? `Termasuk ${first.label}` : undefined;
}

/** Tidak ada data sama sekali untuk filter ini (DB kosong atau filter tanpa hasil): tampilkan keadaan kosong, bukan angka nol. */
export function isOverviewEmpty(data: Overview): boolean {
  return data.kpi.orders === 0 && data.salesByYear.length === 0 && data.customersByCountry.length === 0;
}

// ---- Ringkasan teks (ChartCard.summary), dibaca pembaca layar ----

export function summarizeTopCountries(rows: Overview['topCountriesBySales']): string {
  if (rows.length === 0) return 'Tidak ada penjualan untuk filter ini.';
  const list = rows.map((r) => `${r.country} ${formatUsd(r.sales)}`).join(', ');
  return `${formatNumber(rows.length)} negara teratas menurut penjualan: ${list}.`;
}

export function summarizeContinents(rows: Overview['customersByContinent']): string {
  if (rows.length === 0) return 'Tidak ada customer terdaftar untuk filter ini.';
  return `Customer terdaftar per benua: ${rows.map((r) => `${r.continent} ${formatNumber(r.customers)}`).join(', ')}.`;
}

export function summarizeCustomersByCountry(bars: readonly CountryBar[]): string {
  if (bars.length === 0) return 'Tidak ada customer terdaftar untuk filter ini.';
  const list = bars
    .map((b) => (b.isOthers ? `${b.name} (${formatNumber(b.countries)} negara) ${formatNumber(b.customers)}` : `${b.name} ${formatNumber(b.customers)}`))
    .join(', ');
  return `Customer terdaftar per negara: ${list}.`;
}

export function summarizeSalesByYear(columns: readonly YearColumn[]): string {
  if (columns.length === 0) return 'Tidak ada penjualan untuk filter ini.';
  const list = columns.map((c) => `${c.label} penjualan ${formatUsd(c.sales)}, profit ${formatUsd(c.profit)}`).join('; ');
  return `Penjualan dan profit per tahun: ${list}.`;
}
