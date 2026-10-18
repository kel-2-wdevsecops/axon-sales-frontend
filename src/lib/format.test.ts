import { describe, expect, it } from 'vitest';
import { EMPTY_VALUE, formatMonth, formatMonthShort, formatNumber, formatPercent, formatUsd } from './format';

describe('formatUsd', () => {
  it('memakai format id-ID tanpa spasi setelah US$', () => {
    expect(formatUsd(9604190.61)).toBe('US$9.604.190,61');
    expect(formatUsd(3825880.25)).toBe('US$3.825.880,25');
  });

  it('selalu 2 desimal', () => {
    expect(formatUsd(0)).toBe('US$0,00');
    expect(formatUsd(1234)).toBe('US$1.234,00');
    expect(formatUsd(0.5)).toBe('US$0,50');
  });

  it('nilai negatif memakai tanda minus di depan', () => {
    expect(formatUsd(-1234.5)).toBe('-US$1.234,50');
  });

  it('nilai yang membulat ke nol tidak bertanda minus', () => {
    expect(formatUsd(-0.001)).toBe('US$0,00');
  });

  it('null, undefined, dan bukan angka -> "--"', () => {
    expect(formatUsd(null)).toBe(EMPTY_VALUE);
    expect(formatUsd(undefined)).toBe(EMPTY_VALUE);
    expect(formatUsd(Number.NaN)).toBe(EMPTY_VALUE);
    expect(formatUsd(Number.POSITIVE_INFINITY)).toBe(EMPTY_VALUE);
  });
});

describe('formatNumber', () => {
  it('bilangan bulat dengan pemisah ribuan titik', () => {
    expect(formatNumber(326)).toBe('326');
    expect(formatNumber(1234)).toBe('1.234');
    expect(formatNumber(9604190)).toBe('9.604.190');
  });

  it('membulatkan bila tanpa desimal', () => {
    expect(formatNumber(98.6)).toBe('99');
  });

  it('desimal memakai koma', () => {
    expect(formatNumber(1234.5, 2)).toBe('1.234,50');
    expect(formatNumber(0.126, 1)).toBe('0,1');
  });

  it('null -> "--"', () => {
    expect(formatNumber(null)).toBe(EMPTY_VALUE);
    expect(formatNumber(undefined, 2)).toBe(EMPTY_VALUE);
  });
});

describe('formatPercent', () => {
  it('persen dengan koma desimal', () => {
    expect(formatPercent(39.84)).toBe('39,84%');
    expect(formatPercent(0)).toBe('0,00%');
    expect(formatPercent(12.345, 1)).toBe('12,3%');
  });

  it('negatif tetap bertanda minus', () => {
    expect(formatPercent(-5.5)).toBe('-5,50%');
  });

  it('null -> "--" (mis. margin saat penjualan 0)', () => {
    expect(formatPercent(null)).toBe('--');
    expect(formatPercent(undefined)).toBe('--');
  });
});

describe('nama bulan Indonesia', () => {
  it('formatMonth 1-12', () => {
    const names = Array.from({ length: 12 }, (_, i) => formatMonth(i + 1));
    expect(names).toEqual([
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ]);
  });

  it('formatMonthShort untuk sumbu grafik', () => {
    expect(formatMonthShort(1)).toBe('Jan');
    expect(formatMonthShort(5)).toBe('Mei');
    expect(formatMonthShort(8)).toBe('Agu');
  });

  it('di luar 1-12 atau bukan bilangan bulat -> "--"', () => {
    expect(formatMonth(0)).toBe('--');
    expect(formatMonth(13)).toBe('--');
    expect(formatMonth(1.5)).toBe('--');
    expect(formatMonthShort(Number.NaN)).toBe('--');
  });
});
