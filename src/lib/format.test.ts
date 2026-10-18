import { describe, expect, it } from 'vitest';
import {
  EMPTY_VALUE,
  formatCompact,
  formatMonth,
  formatMonthShort,
  formatNumber,
  formatPercent,
  formatUsd,
  formatUsdCompact,
} from './format';

describe('formatCompact', () => {
  it('juta: angka acuan F01 diringkas satu desimal', () => {
    expect(formatCompact(9604190.61)).toBe('9,6 jt');
    expect(formatCompact(3825880.25)).toBe('3,8 jt');
    expect(formatCompact(3273280.05)).toBe('3,3 jt');
  });

  it('di bawah 1.000 ditulis utuh, tanpa desimal', () => {
    expect(formatCompact(326)).toBe('326');
    expect(formatCompact(0)).toBe('0');
    expect(formatCompact(999)).toBe('999');
  });

  it('ribu, miliar, triliun', () => {
    expect(formatCompact(1250)).toBe('1,3 rb');
    expect(formatCompact(476847.01)).toBe('476,8 rb');
    expect(formatCompact(2_500_000_000)).toBe('2,5 M');
    expect(formatCompact(4_000_000_000_000)).toBe('4 T');
  });

  it('desimal nol tidak ditulis', () => {
    expect(formatCompact(1_000_000)).toBe('1 jt');
    expect(formatCompact(2000)).toBe('2 rb');
  });

  it('naik satuan bila pembulatan mencapai 1.000', () => {
    expect(formatCompact(999_960)).toBe('1 jt');
    expect(formatCompact(999_949)).toBe('999,9 rb');
    expect(formatCompact(999_960_000)).toBe('1 M');
  });

  it('negatif bertanda minus; yang membulat ke nol tidak', () => {
    expect(formatCompact(-1_500_000)).toBe('-1,5 jt');
    expect(formatCompact(-0.2)).toBe('0');
  });

  it('null, undefined, dan bukan angka -> "--"', () => {
    expect(formatCompact(null)).toBe(EMPTY_VALUE);
    expect(formatCompact(undefined)).toBe(EMPTY_VALUE);
    expect(formatCompact(Number.NaN)).toBe(EMPTY_VALUE);
  });
});

describe('formatUsdCompact', () => {
  it('awalan US$ tanpa spasi', () => {
    expect(formatUsdCompact(9604190.61)).toBe('US$9,6 jt');
    expect(formatUsdCompact(326)).toBe('US$326');
  });

  it('negatif: minus di depan US$', () => {
    expect(formatUsdCompact(-1_500_000)).toBe('-US$1,5 jt');
    expect(formatUsdCompact(-0.2)).toBe('US$0');
  });

  it('null -> "--"', () => {
    expect(formatUsdCompact(null)).toBe(EMPTY_VALUE);
  });
});

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
