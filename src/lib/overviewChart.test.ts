import { describe, expect, it } from 'vitest';
import type { Overview } from '@/types';
import {
  groupCustomersByCountry,
  isOverviewEmpty,
  OTHERS_LABEL,
  partialKpiLabel,
  partialYearLabeler,
  summarizeContinents,
  summarizeCustomersByCountry,
  summarizeSalesByYear,
  summarizeTopCountries,
  toYearColumns,
} from './overviewChart';
import { partialPeriods } from './period';

// Angka acuan: backend/test/golden/overview.test.ts (tanpa filter). Profit 2005
// = total (3.825.880,25) dikurangi profit 2003 dan 2004. Daftar customer per
// negara berbentuk data classicmodels (27 negara, 122 customer); hanya Norway = 3
// dan jumlah baris/total yang dijamin golden BE.
const AXON_RANGE = { from: '2003-01-06', to: '2005-05-31' };

const TOP_COUNTRIES: Overview['topCountriesBySales'] = [
  { country: 'USA', sales: 3273280.05 },
  { country: 'Spain', sales: 1099389.09 },
  { country: 'France', sales: 1007374.02 },
  { country: 'Australia', sales: 562582.59 },
  { country: 'New Zealand', sales: 476847.01 },
];

const CONTINENTS: Overview['customersByContinent'] = [
  { continent: 'Europe', customers: 64 },
  { continent: 'North America', customers: 39 },
  { continent: 'Asia', customers: 9 },
  { continent: 'Oceania', customers: 9 },
  { continent: 'Africa', customers: 1 },
];

const SALES_BY_YEAR: Overview['salesByYear'] = [
  { year: 2003, sales: 3317348.39, profit: 1320622.94, isPartial: false },
  { year: 2004, sales: 4515905.51, profit: 1809381.14, isPartial: false },
  { year: 2005, sales: 1770936.71, profit: 695876.17, isPartial: true },
];

const row = (country: string, continent: string, customers: number) => ({ country, continent, customers });
const BY_COUNTRY: Overview['customersByCountry'] = [
  row('USA', 'North America', 36),
  row('Germany', 'Europe', 13),
  row('France', 'Europe', 12),
  row('Spain', 'Europe', 7),
  row('Australia', 'Oceania', 5),
  row('UK', 'Europe', 5),
  row('Italy', 'Europe', 4),
  row('New Zealand', 'Oceania', 4),
  row('Canada', 'North America', 3),
  row('Finland', 'Europe', 3),
  row('Norway', 'Europe', 3),
  row('Singapore', 'Asia', 3),
  row('Switzerland', 'Europe', 3),
  row('Austria', 'Europe', 2),
  row('Belgium', 'Europe', 2),
  row('Denmark', 'Europe', 2),
  row('Ireland', 'Europe', 2),
  row('Japan', 'Asia', 2),
  row('Philippines', 'Asia', 2),
  row('Sweden', 'Europe', 2),
  row('Hong Kong', 'Asia', 1),
  row('Israel', 'Asia', 1),
  row('Netherlands', 'Europe', 1),
  row('Poland', 'Europe', 1),
  row('Portugal', 'Europe', 1),
  row('Russia', 'Europe', 1),
  row('South Africa', 'Africa', 1),
];

describe('groupCustomersByCountry', () => {
  it('27 negara -> 10 teratas + "Lainnya" (17 negara)', () => {
    expect(BY_COUNTRY).toHaveLength(27);
    const bars = groupCustomersByCountry(BY_COUNTRY);
    expect(bars).toHaveLength(11);
    expect(bars.slice(0, 10).map((b) => b.name)).toEqual([
      'USA', 'Germany', 'France', 'Spain', 'Australia', 'UK', 'Italy', 'New Zealand', 'Canada', 'Finland',
    ]);
    expect(bars[10]).toEqual({ name: OTHERS_LABEL, customers: 30, isOthers: true, countries: 17 });
  });

  it('total customer tetap sama setelah pengelompokan', () => {
    const total = (items: { customers: number }[]) => items.reduce((n, i) => n + i.customers, 0);
    expect(total(groupCustomersByCountry(BY_COUNTRY))).toBe(total(BY_COUNTRY));
    expect(total(BY_COUNTRY)).toBe(122);
  });

  it('seri sama banyak diurutkan menurut nama; input tidak diubah', () => {
    const input = [row('UK', 'Europe', 5), row('Australia', 'Oceania', 5), row('USA', 'North America', 36)];
    const copy = structuredClone(input);
    expect(groupCustomersByCountry(input).map((b) => b.name)).toEqual(['USA', 'Australia', 'UK']);
    expect(input).toEqual(copy);
  });

  it('11 negara atau kurang tidak membentuk "Lainnya"', () => {
    expect(groupCustomersByCountry(BY_COUNTRY.slice(0, 10)).some((b) => b.isOthers)).toBe(false);
    const eleven = groupCustomersByCountry(BY_COUNTRY.slice(0, 11));
    expect(eleven).toHaveLength(11);
    expect(eleven.some((b) => b.isOthers)).toBe(false);
    expect(eleven[10].name).toBe('Norway');
  });

  it('12 negara: sisa 2 negara digabung', () => {
    const bars = groupCustomersByCountry(BY_COUNTRY.slice(0, 12));
    expect(bars[10]).toMatchObject({ name: OTHERS_LABEL, customers: 6, countries: 2 });
  });

  it('Norway tampil sebagai satu negara dengan 3 customer', () => {
    const norway = BY_COUNTRY.filter((c) => c.country.startsWith('Norway'));
    expect(groupCustomersByCountry(norway)).toEqual([{ name: 'Norway', customers: 3, isOthers: false, countries: 1 }]);
  });

  it('daftar kosong -> kosong; limit < 1 dibulatkan ke 1', () => {
    expect(groupCustomersByCountry([])).toEqual([]);
    expect(groupCustomersByCountry(BY_COUNTRY.slice(0, 5), 0).map((b) => b.name)).toEqual(['USA', OTHERS_LABEL]);
  });
});

describe('toYearColumns', () => {
  const labeler = partialYearLabeler(AXON_RANGE);

  it('2003, 2004, 2005 berurutan; hanya 2005 berlabel periode parsial', () => {
    const columns = toYearColumns(SALES_BY_YEAR, labeler);
    expect(columns.map((c) => c.label)).toEqual(['2003', '2004', '2005 (Jan-Mei)']);
    expect(columns.map((c) => c.isPartial)).toEqual([false, false, true]);
  });

  it('nilai BE diteruskan apa adanya', () => {
    const [first] = toYearColumns(SALES_BY_YEAR, labeler);
    expect(first).toMatchObject({ year: 2003, sales: 3317348.39, profit: 1320622.94 });
  });

  it('mengurutkan tahun walau respons tidak berurutan, tanpa mengubah input', () => {
    const shuffled = [SALES_BY_YEAR[2], SALES_BY_YEAR[0], SALES_BY_YEAR[1]];
    expect(toYearColumns(shuffled, labeler).map((c) => c.year)).toEqual([2003, 2004, 2005]);
    expect(shuffled.map((r) => r.year)).toEqual([2005, 2003, 2004]);
  });

  it('rentang data belum termuat: tahun parsial berlabel "(parsial)"', () => {
    expect(toYearColumns(SALES_BY_YEAR).map((c) => c.label)).toEqual(['2003', '2004', '2005 (parsial)']);
    expect(toYearColumns(SALES_BY_YEAR, partialYearLabeler(undefined))[2].label).toBe('2005 (parsial)');
  });

  it('kosong -> kosong', () => {
    expect(toYearColumns([], labeler)).toEqual([]);
  });
});

describe('partialYearLabeler', () => {
  it('hanya tahun parsial yang berlabel', () => {
    const labelOf = partialYearLabeler(AXON_RANGE);
    expect(labelOf(2005)).toBe('2005 (Jan-Mei)');
    expect(labelOf(2004)).toBeUndefined();
  });

  it('data berakhir di akhir tahun: tidak ada tahun parsial', () => {
    expect(partialYearLabeler({ from: '2003-01-06', to: '2005-12-31' })(2005)).toBeUndefined();
  });
});

describe('partialKpiLabel', () => {
  it('memakai periode parsial pertama', () => {
    expect(partialKpiLabel(partialPeriods(AXON_RANGE))).toBe('Termasuk 2005 (Jan-Mei)');
  });

  it('tanpa periode parsial -> undefined', () => {
    expect(partialKpiLabel([])).toBeUndefined();
  });
});

describe('isOverviewEmpty', () => {
  const empty: Overview = {
    kpi: { sales: 0, profit: 0, profitMarginPct: null, orders: 0, customers: 0, activeCustomers: 0, employees: 23 },
    topCountriesBySales: [],
    customersByContinent: [],
    customersByCountry: [],
    salesByYear: [],
  };

  it('DB kosong (semua nol, daftar kosong) -> kosong, walau karyawan ada', () => {
    expect(isOverviewEmpty(empty)).toBe(true);
  });

  it('ada order -> tidak kosong', () => {
    expect(isOverviewEmpty({ ...empty, kpi: { ...empty.kpi, orders: 326 }, salesByYear: SALES_BY_YEAR })).toBe(false);
  });

  it('ada customer terdaftar tanpa order (mis. filter tahun) -> tidak kosong', () => {
    expect(isOverviewEmpty({ ...empty, kpi: { ...empty.kpi, customers: 3 }, customersByCountry: BY_COUNTRY.slice(10, 11) })).toBe(false);
  });
});

describe('ringkasan teks', () => {
  it('top negara memakai format US$ id-ID', () => {
    expect(summarizeTopCountries(TOP_COUNTRIES)).toBe(
      '5 negara teratas menurut penjualan: USA US$3.273.280,05, Spain US$1.099.389,09, France US$1.007.374,02, Australia US$562.582,59, New Zealand US$476.847,01.',
    );
    expect(summarizeTopCountries([])).toBe('Tidak ada penjualan untuk filter ini.');
  });

  it('customer per benua', () => {
    expect(summarizeContinents(CONTINENTS)).toBe(
      'Customer terdaftar per benua: Europe 64, North America 39, Asia 9, Oceania 9, Africa 1.',
    );
    expect(summarizeContinents([])).toBe('Tidak ada customer terdaftar untuk filter ini.');
  });

  it('customer per negara menyebut jumlah negara pada "Lainnya"', () => {
    const text = summarizeCustomersByCountry(groupCustomersByCountry(BY_COUNTRY));
    expect(text.startsWith('Customer terdaftar per negara: USA 36, Germany 13,')).toBe(true);
    expect(text.endsWith('Lainnya (17 negara) 30.')).toBe(true);
  });

  it('penjualan dan profit per tahun menyebut label parsial', () => {
    const text = summarizeSalesByYear(toYearColumns(SALES_BY_YEAR, partialYearLabeler(AXON_RANGE)));
    expect(text).toContain('2003 penjualan US$3.317.348,39, profit US$1.320.622,94');
    expect(text).toContain('2005 (Jan-Mei) penjualan US$1.770.936,71');
    expect(summarizeSalesByYear([])).toBe('Tidak ada penjualan untuk filter ini.');
  });
});
