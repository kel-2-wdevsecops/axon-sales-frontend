import { describe, expect, it } from 'vitest';
import { describeDataRange, partialPeriods, relevantPartialPeriods } from './period';

const AXON = { from: '2003-01-06', to: '2005-05-31' };

describe('describeDataRange', () => {
  it('menulis rentang dengan nama bulan Indonesia', () => {
    expect(describeDataRange(AXON)).toBe('6 Januari 2003 - 31 Mei 2005');
  });

  it('rentang kosong atau tidak valid -> null', () => {
    expect(describeDataRange({ from: null, to: null })).toBeNull();
    expect(describeDataRange({ from: '2003-01-06', to: '2005-13-01' })).toBeNull();
    expect(describeDataRange({ from: 'kemarin', to: '2005-05-31' })).toBeNull();
    expect(describeDataRange({ from: '2003-01-06', to: '2005-02-30' })).toBeNull();
  });
});

describe('partialPeriods', () => {
  it('data sampai 31 Mei 2005: tahun 2005 dan Q2 2005 parsial, Mei lengkap', () => {
    expect(partialPeriods(AXON).map((p) => p.label)).toEqual(['2005 (Jan-Mei)', 'Q2 2005 (Apr-Mei)']);
  });

  it('data berakhir di akhir kuartal: hanya tahun yang parsial', () => {
    expect(partialPeriods({ from: '2003-01-06', to: '2005-06-30' }).map((p) => p.kind)).toEqual(['year']);
  });

  it('data berakhir di tengah bulan: bulan itu ikut parsial', () => {
    const periods = partialPeriods({ from: '2003-01-06', to: '2005-05-15' });
    expect(periods.map((p) => p.kind)).toEqual(['year', 'quarter', 'month']);
    expect(periods[2]?.label).toBe('Mei 2005 (s.d. tanggal 15)');
  });

  it('data berakhir 31 Desember: tidak ada periode parsial', () => {
    expect(partialPeriods({ from: '2003-01-06', to: '2004-12-31' })).toEqual([]);
  });

  it('tahun pertama yang parsial dipotong oleh awal data', () => {
    expect(partialPeriods({ from: '2005-03-10', to: '2005-05-31' }).map((p) => p.label)).toEqual([
      '2005 (Mar-Mei)',
      'Q2 2005 (Apr-Mei)',
    ]);
  });

  it('satu bulan saja ditulis tanpa rentang', () => {
    expect(partialPeriods({ from: '2003-01-06', to: '2005-04-30' }).map((p) => p.label)).toEqual(['2005 (Jan-Apr)', 'Q2 2005 (Apr)']);
  });

  it('rentang tidak ada -> kosong', () => {
    expect(partialPeriods({ from: null, to: null })).toEqual([]);
  });
});

describe('relevantPartialPeriods', () => {
  const labels = (filter: Parameters<typeof relevantPartialPeriods>[0], range = AXON) =>
    relevantPartialPeriods(filter, range).map((p) => p.label);

  it('tahun 2005 tanpa bulan: tahun dan kuartal parsial tampil', () => {
    expect(labels({ year: 2005 })).toEqual(['2005 (Jan-Mei)', 'Q2 2005 (Apr-Mei)']);
  });

  it('semua tahun: data memuat 2005 sehingga labelnya tetap tampil', () => {
    expect(labels({})).toEqual(['2005 (Jan-Mei)', 'Q2 2005 (Apr-Mei)']);
  });

  it('tahun lain: tidak ada label', () => {
    expect(labels({ year: 2004 })).toEqual([]);
  });

  it('filter bulan menghilangkan label tahun/kuartal', () => {
    expect(labels({ year: 2005, month: 3 })).toEqual([]);
    expect(labels({ month: 3 })).toEqual([]);
  });

  it('bulan parsial tampil hanya saat bulan itu dipilih', () => {
    const range = { from: '2003-01-06', to: '2005-05-15' };
    expect(labels({ year: 2005, month: 5 }, range)).toEqual(['Mei 2005 (s.d. tanggal 15)']);
    expect(labels({ year: 2005, month: 4 }, range)).toEqual([]);
  });
});
