import type { DashboardFilter, FilterOptions } from '@/types';
import { formatMonth, formatMonthShort } from './format';

// Periode parsial: periode yang berakhir setelah tanggal order terakhir
// (`dataRange.to`, saat ini 31 Mei 2005), mis. tahun 2005 dan Q2 2005.
// Dihitung dari dataRange BE supaya ikut benar bila datanya bertambah.

type DataRange = FilterOptions['dataRange'];

export interface PartialPeriod {
  kind: 'year' | 'quarter' | 'month';
  year: number;
  /** 1-4 untuk `quarter`, 1-12 untuk `month`. */
  index?: number;
  /** Mis. "2005 (Jan-Mei)", "Q2 2005 (Apr-Mei)". */
  label: string;
}

interface IsoDate {
  year: number;
  month: number;
  day: number;
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseIsoDate(value: string | null): IsoDate | null {
  const match = value === null ? null : ISO_DATE.exec(value);
  if (!match) return null;
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  return date.month >= 1 && date.month <= 12 && date.day >= 1 && date.day <= daysInMonth(date.year, date.month) ? date : null;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** "6 Januari 2003 - 31 Mei 2005"; null bila rentang tidak ada/tidak valid. */
export function describeDataRange(range: DataRange): string | null {
  const from = parseIsoDate(range.from);
  const to = parseIsoDate(range.to);
  if (!from || !to) return null;
  const text = (d: IsoDate) => `${d.day} ${formatMonth(d.month)} ${d.year}`;
  return `${text(from)} - ${text(to)}`;
}

/** "31 Mei 2005"; null bila kosong atau bukan tanggal 'YYYY-MM-DD' yang valid. */
export function formatIsoDate(value: string | null): string | null {
  const date = parseIsoDate(value);
  return date ? `${date.day} ${formatMonth(date.month)} ${date.year}` : null;
}

function span(firstMonth: number, lastMonth: number): string {
  return firstMonth === lastMonth ? formatMonthShort(lastMonth) : `${formatMonthShort(firstMonth)}-${formatMonthShort(lastMonth)}`;
}

/**
 * Semua periode parsial pada ujung data: tahun, kuartal, dan/atau bulan yang
 * memuat tanggal terakhir tetapi belum lengkap. Kosong bila data berakhir
 * tepat di akhir periode atau rentangnya tidak ada.
 */
export function partialPeriods(range: DataRange): PartialPeriod[] {
  const to = parseIsoDate(range.to);
  if (!to) return [];
  const from = parseIsoDate(range.from);

  const monthComplete = to.day === daysInMonth(to.year, to.month);
  const quarter = Math.ceil(to.month / 3);
  const periods: PartialPeriod[] = [];

  // Awal tahun/kuartal dipotong oleh awal data bila data baru mulai di tengah periode.
  const startsHere = (year: number, month: number) => (from && from.year === year ? Math.max(from.month, month) : month);

  if (!(to.month === 12 && monthComplete)) {
    periods.push({ kind: 'year', year: to.year, label: `${to.year} (${span(startsHere(to.year, 1), to.month)})` });
  }
  if (!(to.month === quarter * 3 && monthComplete)) {
    const first = startsHere(to.year, (quarter - 1) * 3 + 1);
    periods.push({ kind: 'quarter', year: to.year, index: quarter, label: `Q${quarter} ${to.year} (${span(first, to.month)})` });
  }
  if (!monthComplete) {
    periods.push({ kind: 'month', year: to.year, index: to.month, label: `${formatMonth(to.month)} ${to.year} (s.d. tanggal ${to.day})` });
  }
  return periods;
}

/**
 * Periode parsial yang ikut dalam tampilan `filter`: tahun/kuartal ikut bila
 * filter bulan kosong dan tahunnya sama (atau kosong = semua tahun); bulan
 * parsial ikut bila bulan itu yang dipilih.
 */
export function relevantPartialPeriods(filter: DashboardFilter, range: DataRange): PartialPeriod[] {
  return partialPeriods(range).filter((period) => {
    if (filter.year !== undefined && filter.year !== period.year) return false;
    if (period.kind === 'month') return filter.month === period.index;
    return filter.month === undefined;
  });
}
