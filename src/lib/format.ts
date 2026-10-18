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

// Satuan ringkas Indonesia (skala pendek), dari terbesar ke terkecil.
const COMPACT_UNITS = [
  { size: 1e12, suffix: 'T' },
  { size: 1e9, suffix: 'M' },
  { size: 1e6, suffix: 'jt' },
  { size: 1e3, suffix: 'rb' },
] as const;

const compactFormat = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 0, maximumFractionDigits: 1 });

const roundOneDecimal = (value: number) => Math.round(value * 10) / 10;

/**
 * Angka diringkas untuk kartu dan sumbu grafik: `9.604.190` -> `9,6 jt`,
 * `326` -> `326`, `1.250` -> `1,3 rb`. Satu desimal paling banyak; satuan
 * naik bila pembulatan mencapai 1.000 (999.960 -> `1 jt`, bukan `1.000 rb`).
 * Nilai penuhnya ditampilkan terpisah (tooltip), jadi ini hanya pembulatan tampilan.
 */
export function formatCompact(value: number | null | undefined): string {
  if (!isNumber(value)) return EMPTY_VALUE;
  const abs = Math.abs(value);
  const bodyOf = (): string => {
    for (let i = 0; i < COMPACT_UNITS.length; i++) {
      const unit = COMPACT_UNITS[i];
      if (abs < unit.size) continue;
      const larger = COMPACT_UNITS[i - 1];
      const roundsUp = larger !== undefined && roundOneDecimal(abs / unit.size) >= 1000;
      const used = roundsUp ? larger : unit;
      return `${compactFormat.format(roundOneDecimal(abs / used.size))} ${used.suffix}`;
    }
    return numberFormat(0).format(abs);
  };
  const body = bodyOf();
  return `${value < 0 && /[1-9]/.test(body) ? '-' : ''}${body}`;
}

/** Dolar AS ringkas: `US$9,6 jt`. Nilai penuhnya lewat `formatUsd`. */
export function formatUsdCompact(value: number | null | undefined): string {
  if (!isNumber(value)) return EMPTY_VALUE;
  const body = formatCompact(Math.abs(value));
  return `${value < 0 && /[1-9]/.test(body) ? '-' : ''}US$${body}`;
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
