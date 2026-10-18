import { describe, expect, it } from 'vitest';
import type { Growth } from '@/types';
import {
  describeGrowth,
  formatSignedPercent,
  growthDirection,
  isGrowthEmpty,
  MINUS_SIGN,
  monthLabel,
  partialTooltip,
  quarterLabel,
  summarizeYearBars,
  summarizeYtd,
  toYearBars,
  yearLabel,
  ytdPeriodLabel,
} from './growth';
import { partialPeriods } from './period';

// Angka acuan: docs/features/F03-pertumbuhan.md (sama dengan golden BE F03).
const AXON_RANGE = { from: '2003-01-06', to: '2005-05-31' };
const MINUS = '\u2212';

describe('formatSignedPercent', () => {
  it('positif diberi +, locale id-ID, spasi sebelum %', () => {
    expect(formatSignedPercent(36.13)).toBe('+36,13 %');
    expect(formatSignedPercent(188.39)).toBe('+188,39 %');
    expect(formatSignedPercent(5.66)).toBe('+5,66 %');
    expect(formatSignedPercent(1234.5)).toBe('+1.234,50 %');
  });

  it('negatif memakai tanda minus sebenarnya (U+2212), bukan tanda hubung', () => {
    expect(formatSignedPercent(-60.78)).toBe(`${MINUS}60,78 %`);
    expect(formatSignedPercent(-71.99)).toBe(`${MINUS}71,99 %`);
    expect(formatSignedPercent(-55.06)).toBe(`${MINUS}55,06 %`);
    expect(MINUS_SIGN).toBe(MINUS);
    expect(formatSignedPercent(-1)).not.toContain('-');
  });

  it('null/undefined -> "--"', () => {
    expect(formatSignedPercent(null)).toBe('--');
    expect(formatSignedPercent(undefined)).toBe('--');
  });

  it('tidak pernah menampilkan NaN atau Infinity', () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const text = formatSignedPercent(bad);
      expect(text).toBe('--');
      expect(text).not.toMatch(/NaN|Infinity/);
    }
  });

  it('nol, dan nilai yang membulat ke nol, tanpa tanda (tidak ada "-0,00 %")', () => {
    expect(formatSignedPercent(0)).toBe('0,00 %');
    expect(formatSignedPercent(-0)).toBe('0,00 %');
    expect(formatSignedPercent(0.004)).toBe('0,00 %');
    expect(formatSignedPercent(-0.004)).toBe('0,00 %');
    expect(formatSignedPercent(0.005)).toBe('+0,01 %');
  });
});

describe('growthDirection', () => {
  it('naik, turun, netral, tidak ada', () => {
    expect(growthDirection(36.13)).toBe('up');
    expect(growthDirection(-60.78)).toBe('down');
    expect(growthDirection(0)).toBe('flat');
    expect(growthDirection(-0.004)).toBe('flat');
    expect(growthDirection(null)).toBe('none');
    expect(growthDirection(undefined)).toBe('none');
    expect(growthDirection(Number.NaN)).toBe('none');
    expect(growthDirection(Number.POSITIVE_INFINITY)).toBe('none');
  });

  it('selalu konsisten dengan teks yang tampil', () => {
    for (const value of [12.3, -12.3, 0, 0.004, -0.004, null]) {
      const text = formatSignedPercent(value);
      const direction = growthDirection(value);
      expect(text.startsWith('+')).toBe(direction === 'up');
      expect(text.startsWith(MINUS)).toBe(direction === 'down');
      expect(text === '--').toBe(direction === 'none');
    }
  });
});

describe('label periode', () => {
  it('tahun, kuartal, bulan', () => {
    expect(yearLabel(2004)).toBe('2004');
    expect(quarterLabel(2004, 1)).toBe('Q1 2004');
    expect(quarterLabel(2003, 4)).toBe('Q4 2003');
    expect(monthLabel(2004, 1)).toBe('Januari 2004');
    expect(monthLabel(2003, 12)).toBe('Desember 2003');
    expect(monthLabel(2005, 5)).toBe('Mei 2005');
  });

  it('bulan di luar 1-12 -> "--"', () => {
    expect(monthLabel(2004, 0)).toBe('--');
    expect(monthLabel(2004, 13)).toBe('--');
  });

  it('rentang YTD', () => {
    expect(ytdPeriodLabel(2005, 5)).toBe('Jan-Mei 2005');
    expect(ytdPeriodLabel(2004, 5)).toBe('Jan-Mei 2004');
    expect(ytdPeriodLabel(2005, 12)).toBe('Jan-Des 2005');
    expect(ytdPeriodLabel(2005, 1)).toBe('Jan 2005');
  });
});

describe('partialTooltip', () => {
  it('tanggal diambil dari dataRange.to dalam bahasa Indonesia', () => {
    expect(partialTooltip(AXON_RANGE.to)).toBe('data sampai 31 Mei 2005');
    expect(partialTooltip('2005-06-15')).toBe('data sampai 15 Juni 2005');
  });

  it('tanggal kosong atau tidak valid tidak menghasilkan "null"/"NaN"', () => {
    expect(partialTooltip(null)).toBe('data belum lengkap');
    expect(partialTooltip('bukan-tanggal')).toBe('data belum lengkap');
    expect(partialTooltip('2005-02-30')).toBe('data belum lengkap');
  });
});

describe('describeGrowth', () => {
  it('naik/turun dengan pembanding', () => {
    expect(describeGrowth({ growthPct: 36.13, previous: 3317348.39 })).toBe('naik 36,13 % dari US$3.317.348,39');
    expect(describeGrowth({ growthPct: -60.78, previous: 4515905.51 })).toBe('turun 60,78 % dari US$4.515.905,51');
  });

  it('tanpa pembanding / netral', () => {
    expect(describeGrowth({ growthPct: null, previous: null })).toBe('tidak ada pembanding');
    expect(describeGrowth({ growthPct: null, previous: 0 })).toBe('tidak ada pembanding');
    expect(describeGrowth({ growthPct: 0, previous: 100 })).toBe('tidak berubah dari US$100,00');
  });
});

const YEARLY: Growth['yearly'] = [
  { year: 2003, sales: 3317348.39, previous: null, growthPct: null, isPartial: false },
  { year: 2004, sales: 4515905.51, previous: 3317348.39, growthPct: 36.13, isPartial: false },
  { year: 2005, sales: 1770936.71, previous: 4515905.51, growthPct: -60.78, isPartial: true },
];
const SALES_PROFIT: Growth['salesProfitByYear'] = [
  { year: 2005, sales: 1770936.71, profit: 695876.17 },
  { year: 2003, sales: 3317348.39, profit: 1320622.94 },
  { year: 2004, sales: 4515905.51, profit: 1809381.14 },
];

describe('toYearBars', () => {
  it('urut tahun naik; tahun parsial berlabel periodenya dari rentang data BE', () => {
    const yearPeriod = partialPeriods(AXON_RANGE).find((p) => p.kind === 'year');
    const bars = toYearBars({ salesProfitByYear: SALES_PROFIT, yearly: YEARLY }, (y) =>
      yearPeriod?.year === y ? yearPeriod.label : undefined,
    );
    expect(bars.map((b) => b.label)).toEqual(['2003', '2004', '2005 (Jan-Mei)']);
    expect(bars.map((b) => b.isPartial)).toEqual([false, false, true]);
    expect(bars[2]).toMatchObject({ year: 2005, sales: 1770936.71, profit: 695876.17 });
  });

  it('tanpa label periode dipakai "(parsial)"; tidak mengubah input', () => {
    const input = { salesProfitByYear: SALES_PROFIT, yearly: YEARLY };
    expect(toYearBars(input)[2].label).toBe('2005 (parsial)');
    expect(SALES_PROFIT[0].year).toBe(2005);
  });

  it('tahun tanpa baris yearly (mis. data belum ada) tidak dianggap parsial', () => {
    const bars = toYearBars({ salesProfitByYear: SALES_PROFIT, yearly: [] });
    expect(bars.every((b) => !b.isPartial)).toBe(true);
  });
});

describe('ringkasan teks', () => {
  it('summarizeYtd: angka acuan 1.770.936,71 vs 1.235.480,38 = +43,34 %', () => {
    const text = summarizeYtd({ year: 2005, throughMonth: 5, sales: 1770936.71, previous: 1235480.38, growthPct: 43.34 });
    expect(text).toBe(
      'Penjualan Jan-Mei 2005 US$1.770.936,71 dibanding Jan-Mei 2004 US$1.235.480,38: naik 43,34 % dari US$1.235.480,38.',
    );
  });

  it('summarizeYearBars', () => {
    expect(summarizeYearBars([])).toBe('Tidak ada penjualan untuk filter ini.');
    const bars = toYearBars({ salesProfitByYear: SALES_PROFIT.slice(0, 1), yearly: YEARLY });
    expect(summarizeYearBars(bars)).toBe(
      'Penjualan dan profit per tahun: 2005 (parsial) penjualan US$1.770.936,71, profit US$695.876,17.',
    );
  });
});

describe('isGrowthEmpty', () => {
  const empty: Growth = {
    dataRange: { from: null, to: null },
    ytd: null,
    yearly: [],
    quarterly: [],
    monthly: [],
    salesProfitByYear: [],
  };

  it('semua kosong -> true', () => {
    expect(isGrowthEmpty(empty)).toBe(true);
  });

  it('ada satu bagian saja -> false', () => {
    expect(isGrowthEmpty({ ...empty, yearly: YEARLY })).toBe(false);
    expect(isGrowthEmpty({ ...empty, salesProfitByYear: SALES_PROFIT })).toBe(false);
    expect(
      isGrowthEmpty({ ...empty, ytd: { year: 2005, throughMonth: 5, sales: 1, previous: 1, growthPct: 0 } }),
    ).toBe(false);
  });
});
