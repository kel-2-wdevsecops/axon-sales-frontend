// Pemformat tampilan (locale id-ID). BE mengirim angka mentah (number); format
// dilakukan di sini dan tidak pernah menghitung ulang angka BE.

/** Pengganti nilai yang tidak ada (null/undefined/bukan angka), mis. margin saat penjualan 0. */
export const EMPTY_VALUE = '--';

const LOCALE = 'id-ID';

// Intl.NumberFormat mahal dibuat; satu instance per jumlah desimal.
const numberFormats = new Map<number, Intl.NumberFormat>();
function numberFormat(fractionDigits: number): Intl.NumberFormat {
  let format = numberFormats.get(fractionDigits);
  if (!format) {
    format = new Intl.NumberFormat(LOCALE, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    numberFormats.set(fractionDigits, format);
  }
  return format;
}

const monthLong = new Intl.DateTimeFormat(LOCALE, { month: 'long', timeZone: 'UTC' });
const monthShort = new Intl.DateTimeFormat(LOCALE, { month: 'short', timeZone: 'UTC' });

function isNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Dolar AS format Indonesia: `US$9.604.190,61`. Awalan ditulis sendiri (bukan
 * `style: 'currency'`) supaya hasilnya sama di semua browser/ICU, tanpa spasi tak terlihat.
 */
export function formatUsd(value: number | null | undefined): string {
  if (!isNumber(value)) return EMPTY_VALUE;
  const body = numberFormat(2).format(Math.abs(value));
  // "-US$0,00" tidak boleh muncul untuk nilai yang membulat ke nol.
  return `${value < 0 && /[1-9]/.test(body) ? '-' : ''}US$${body}`;
}

/** Angka format Indonesia: `326`, `9.604.190`; dengan `fractionDigits` = 2 -> `1.234,50`. */
export function formatNumber(value: number | null | undefined, fractionDigits = 0): string {
  if (!isNumber(value)) return EMPTY_VALUE;
  return numberFormat(fractionDigits).format(value);
}

/** Persen dari nilai yang sudah berupa persen (39.84 -> `39,84%`); null -> `--`. */
export function formatPercent(value: number | null | undefined, fractionDigits = 2): string {
  if (!isNumber(value)) return EMPTY_VALUE;
  return `${formatNumber(value, fractionDigits)}%`;
}

function monthDate(month: number): Date | null {
  return Number.isInteger(month) && month >= 1 && month <= 12 ? new Date(Date.UTC(2000, month - 1, 1)) : null;
}

/** Nama bulan Indonesia dari angka 1-12: `Januari`, `Agustus`; di luar rentang -> `--`. */
export function formatMonth(month: number): string {
  const date = monthDate(month);
  return date ? monthLong.format(date) : EMPTY_VALUE;
}

/** Singkatan bulan untuk sumbu grafik: `Jan`, `Mei`, `Agu`. */
export function formatMonthShort(month: number): string {
  const date = monthDate(month);
  return date ? monthShort.format(date) : EMPTY_VALUE;
}
