import type { Growth, GrowthPoint, YearToDate } from '@/types';
import { EMPTY_VALUE, formatMonth, formatMonthShort, formatNumber, formatUsd } from './format';
import { formatIsoDate } from './period';

// Penyajian respons GET /dashboard/growth (F03). Fungsi murni: pertumbuhan,
// periode pembanding, dan status parsial dihitung BE; di sini hanya format,
// label, dan teks alternatif. Tidak ada angka yang dihitung ulang.

/** Tanda minus sebenarnya (U+2212), bukan tanda hubung, supaya sejajar dengan "+" dan terbaca sebagai minus. */
export const MINUS_SIGN = '\u2212';

export type GrowthDirection = 'up' | 'down' | 'flat' | 'none';

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Persen dibulatkan ke dua desimal sebagaimana ditampilkan; `0` bila membulat ke nol. */
const hundredths = (value: number) => Math.round(Math.abs(value) * 100);

/**
 * Arah pertumbuhan menurut nilai yang ditampilkan: `none` bila tidak ada
 * pembanding (null/bukan angka), `flat` bila membulat ke 0,00 (tidak ada tanda).
 */
export function growthDirection(value: number | null | undefined): GrowthDirection {
  if (!isFiniteNumber(value)) return 'none';
  if (hundredths(value) === 0) return 'flat';
  return value > 0 ? 'up' : 'down';
}

/**
 * Persen bertanda format Indonesia: `+36,13 %`, minus sebenarnya + `60,78 %`, `0,00 %`.
 * null/NaN/Infinity -> `--` (tidak pernah "NaN" atau "Infinity").
 */
export function formatSignedPercent(value: number | null | undefined): string {
  const direction = growthDirection(value);
  if (direction === 'none' || !isFiniteNumber(value)) return EMPTY_VALUE;
  if (direction === 'flat') return `${formatNumber(0, 2)} %`;
  return `${direction === 'up' ? '+' : MINUS_SIGN}${formatNumber(Math.abs(value), 2)} %`;
}

/** Label tahun: `2004`. */
export function yearLabel(year: number): string {
  return String(year);
}

/** Label kuartal: `Q1 2004`. */
export function quarterLabel(year: number, quarter: number): string {
  return `Q${quarter} ${year}`;
}

/** Label bulan: `Januari 2004`; bulan di luar 1-12 -> `--`. */
export function monthLabel(year: number, month: number): string {
  const name = formatMonth(month);
  return name === EMPTY_VALUE ? EMPTY_VALUE : `${name} ${year}`;
}

/** Teks tooltip baris parsial: `data sampai 31 Mei 2005`; tanggal tidak ada/tidak valid -> `data belum lengkap`. */
export function partialTooltip(dataTo: string | null): string {
  const date = formatIsoDate(dataTo);
  return date ? `data sampai ${date}` : 'data belum lengkap';
}

/** Rentang YTD: `Jan-Mei 2005`, atau `Jan 2005` bila baru sampai Januari. */
export function ytdPeriodLabel(year: number, throughMonth: number): string {
  const last = formatMonthShort(throughMonth);
  return throughMonth === 1 ? `${last} ${year}` : `${formatMonthShort(1)}-${last} ${year}`;
}

/** Tidak ada data sama sekali: tampilkan keadaan kosong, bukan tabel dan kartu kosong. */
export function isGrowthEmpty(data: Growth): boolean {
  return (
    data.ytd === null &&
    data.yearly.length === 0 &&
    data.quarterly.length === 0 &&
    data.monthly.length === 0 &&
    data.salesProfitByYear.length === 0
  );
}

// ---- Data grafik ----

export interface YearBar {
  year: number;
  /** Label sumbu: `2004`, atau `2005 (Jan-Mei)` untuk tahun parsial. */
  label: string;
  sales: number;
  profit: number;
  isPartial: boolean;
}

/**
 * Penjualan dan profit per tahun, urut tahun naik. Status parsial diambil dari
 * baris `yearly` (BE); tahun parsial diberi label dari `partialLabelOf`, atau
 * `(parsial)` bila label periodenya tidak tersedia.
 */
export function toYearBars(
  data: Pick<Growth, 'salesProfitByYear' | 'yearly'>,
  partialLabelOf: (year: number) => string | undefined = () => undefined,
): YearBar[] {
  const partialYears = new Set(data.yearly.filter((row) => row.isPartial).map((row) => row.year));
  return [...data.salesProfitByYear]
    .sort((a, b) => a.year - b.year)
    .map((row) => {
      const isPartial = partialYears.has(row.year);
      return {
        year: row.year,
        label: isPartial ? (partialLabelOf(row.year) ?? `${row.year} (parsial)`) : String(row.year),
        sales: row.sales,
        profit: row.profit,
        isPartial,
      };
    });
}

// ---- Ringkasan teks (dibaca pembaca layar / alternatif grafik) ----

/** Satu kalimat pertumbuhan untuk pembaca layar, mis. "naik 36,13 % dari US$3.317.348,39". */
export function describeGrowth(row: Pick<GrowthPoint, 'growthPct' | 'previous'>): string {
  const direction = growthDirection(row.growthPct);
  if (direction === 'none' || !isFiniteNumber(row.growthPct)) return 'tidak ada pembanding';
  const amount = `${formatNumber(Math.abs(row.growthPct), 2)} %`;
  const from = isFiniteNumber(row.previous) ? ` dari ${formatUsd(row.previous)}` : '';
  if (direction === 'flat') return `tidak berubah${from}`;
  return `${direction === 'up' ? 'naik' : 'turun'} ${amount}${from}`;
}

export function summarizeYtd(ytd: YearToDate): string {
  const now = ytdPeriodLabel(ytd.year, ytd.throughMonth);
  const before = ytdPeriodLabel(ytd.year - 1, ytd.throughMonth);
  return `Penjualan ${now} ${formatUsd(ytd.sales)} dibanding ${before} ${formatUsd(ytd.previous)}: ${describeGrowth(ytd)}.`;
}

export function summarizeYearBars(bars: readonly YearBar[]): string {
  if (bars.length === 0) return 'Tidak ada penjualan untuk filter ini.';
  const list = bars.map((b) => `${b.label} penjualan ${formatUsd(b.sales)}, profit ${formatUsd(b.profit)}`).join('; ');
  return `Penjualan dan profit per tahun: ${list}.`;
}
