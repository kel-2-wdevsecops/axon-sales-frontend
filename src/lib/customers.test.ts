import { describe, expect, it } from 'vitest';
import type { CreditSegmentRow, Customers, OfficeRow, SalesRepRow } from '@/types';
import {
  hasCreditCustomers,
  isCustomersEmpty,
  nextSort,
  sortRows,
  summarizeCreditSegments,
  summarizeOffices,
  summarizeSalesReps,
  textOrDash,
  type SortValue,
} from './customers';

// Angka mengikuti contoh/acuan di docs/features/F04-pelanggan-tim-sales.md.
const REPS: SalesRepRow[] = [
  { employeeNumber: 1370, name: 'Gerard Hernandez', office: 'Paris', customers: 7, orders: 43, sales: 1258577.81 },
  { employeeNumber: 1165, name: 'Leslie Jennings', office: 'San Francisco', customers: 6, orders: 34, sales: 1081530.54 },
  { employeeNumber: 1504, name: 'Barry Jones', office: 'London', customers: 9, orders: 30, sales: 700000 },
  { employeeNumber: 1337, name: 'Loui Bondur', office: 'Paris', customers: 6, orders: 20, sales: 600000 },
  { employeeNumber: 1166, name: 'Tom King', office: 'Sydney', customers: 0, orders: 0, sales: 0 },
  { employeeNumber: 1621, name: 'Yoshimi Kato', office: 'Tokyo', customers: 0, orders: 0, sales: 0 },
];

type RepKey = 'name' | 'office' | 'customers' | 'orders' | 'sales';
const REP_ACCESSORS: Record<RepKey, (row: SalesRepRow) => SortValue> = {
  name: (r) => r.name,
  office: (r) => r.office,
  customers: (r) => r.customers,
  orders: (r) => r.orders,
  sales: (r) => r.sales,
};
const names = (rows: readonly SalesRepRow[]) => rows.map((r) => r.name);

const SEGMENTS: CreditSegmentRow[] = [
  { segment: 'none', label: 'Tanpa limit (0)', customers: 24 },
  { segment: 'low', label: '< 10.000', customers: 0 },
  { segment: 'medium', label: '10.000-75.000', customers: 36 },
  { segment: 'high', label: '> 75.000', customers: 62 },
];

const emptyCustomers = (over: Partial<Customers['kpi']> = {}): Customers => ({
  kpi: { customers: 0, activeCustomers: 0, prospects: 0, withoutSalesRep: 0, avgOrderValue: null, ...over },
  topCustomers: [],
  salesReps: [],
  offices: [],
  creditSegments: [],
});

describe('sortRows', () => {
  it('angka menurun: nilai terbesar di atas, seri tetap dalam urutan BE', () => {
    const sorted = sortRows(REPS, { key: 'customers', direction: 'desc' }, REP_ACCESSORS);
    expect(names(sorted)).toEqual(['Barry Jones', 'Gerard Hernandez', 'Leslie Jennings', 'Loui Bondur', 'Tom King', 'Yoshimi Kato']);
  });

  it('angka menaik menaruh rep tanpa customer di atas, seri tetap dalam urutan BE', () => {
    const sorted = sortRows(REPS, { key: 'customers', direction: 'asc' }, REP_ACCESSORS);
    expect(names(sorted).slice(0, 2)).toEqual(['Tom King', 'Yoshimi Kato']);
  });

  it('teks naik/turun tanpa membedakan huruf besar/kecil', () => {
    const rows = [...REPS, { ...REPS[0], employeeNumber: 1, name: 'andy Patterson' }];
    const asc = names(sortRows(rows, { key: 'name', direction: 'asc' }, REP_ACCESSORS));
    expect(asc[0]).toBe('andy Patterson');
    expect(names(sortRows(rows, { key: 'name', direction: 'desc' }, REP_ACCESSORS))).toEqual([...asc].reverse());
  });

  it('angka di dalam teks dibandingkan sebagai angka', () => {
    const rows = [
      { ...REPS[0], employeeNumber: 1, name: 'Rep 10' },
      { ...REPS[0], employeeNumber: 2, name: 'Rep 2' },
    ];
    expect(names(sortRows(rows, { key: 'name', direction: 'asc' }, REP_ACCESSORS))).toEqual(['Rep 2', 'Rep 10']);
  });

  it('nilai null selalu di bawah, apa pun arahnya', () => {
    type Row = { id: string; share: number | null };
    const rows: Row[] = [
      { id: 'a', share: null },
      { id: 'b', share: 8.55 },
      { id: 'c', share: 6.2 },
    ];
    const accessors = { share: (r: Row) => r.share };
    expect(sortRows(rows, { key: 'share', direction: 'desc' }, accessors).map((r) => r.id)).toEqual(['b', 'c', 'a']);
    expect(sortRows(rows, { key: 'share', direction: 'asc' }, accessors).map((r) => r.id)).toEqual(['c', 'b', 'a']);
  });

  it('tidak mengubah larik masukan dan larik kosong aman', () => {
    const input = [...REPS];
    sortRows(input, { key: 'sales', direction: 'asc' }, REP_ACCESSORS);
    expect(input).toEqual(REPS);
    expect(sortRows([], { key: 'sales', direction: 'desc' }, REP_ACCESSORS)).toEqual([]);
  });

  it('setiap kolom angka terurut benar', () => {
    for (const key of ['customers', 'orders', 'sales'] as const) {
      const values = sortRows(REPS, { key, direction: 'desc' }, REP_ACCESSORS).map((r) => r[key]);
      expect(values).toEqual([...values].sort((a, b) => b - a));
    }
  });
});

describe('nextSort', () => {
  const TEXT: readonly RepKey[] = ['name', 'office'];

  it('mengklik kolom aktif membalik arah', () => {
    expect(nextSort({ key: 'sales', direction: 'desc' }, 'sales', TEXT)).toEqual({ key: 'sales', direction: 'asc' });
    expect(nextSort({ key: 'sales', direction: 'asc' }, 'sales', TEXT)).toEqual({ key: 'sales', direction: 'desc' });
  });

  it('kolom angka baru mulai dari terbesar, kolom teks dari A-Z', () => {
    const current = { key: 'sales', direction: 'desc' } as const;
    expect(nextSort(current, 'customers', TEXT)).toEqual({ key: 'customers', direction: 'desc' });
    expect(nextSort(current, 'name', TEXT)).toEqual({ key: 'name', direction: 'asc' });
  });
});

describe('textOrDash', () => {
  it('teks dipertahankan, kosong atau null menjadi --', () => {
    expect(textOrDash('EMEA')).toBe('EMEA');
    expect(textOrDash('  ')).toBe('--');
    expect(textOrDash('')).toBe('--');
    expect(textOrDash(null)).toBe('--');
    expect(textOrDash(undefined)).toBe('--');
  });
});

describe('isCustomersEmpty', () => {
  it('tanpa customer, aktif, dan top customer = kosong', () => {
    expect(isCustomersEmpty(emptyCustomers())).toBe(true);
  });

  it('tahun tanpa order tetapi customer terdaftar ada: bukan kosong', () => {
    expect(isCustomersEmpty(emptyCustomers({ customers: 122, prospects: 24 }))).toBe(false);
  });

  it('ada customer aktif: bukan kosong', () => {
    expect(isCustomersEmpty(emptyCustomers({ activeCustomers: 1 }))).toBe(false);
  });
});

describe('hasCreditCustomers', () => {
  it('benar bila ada segmen berisi customer, salah bila semua 0 atau kosong', () => {
    expect(hasCreditCustomers(SEGMENTS)).toBe(true);
    expect(hasCreditCustomers(SEGMENTS.map((s) => ({ ...s, customers: 0 })))).toBe(false);
    expect(hasCreditCustomers([])).toBe(false);
  });
});

describe('ringkasan teks', () => {
  it('sales rep: urutan BE dipertahankan, rep tanpa customer tetap disebut, angka format Indonesia', () => {
    const text = summarizeSalesReps(REPS);
    expect(text).toContain('Gerard Hernandez (Paris) penjualan US$1.258.577,81, 7 customer');
    expect(text).toContain('Tom King (Sydney) penjualan US$0,00, 0 customer');
    expect(text.indexOf('Gerard')).toBeLessThan(text.indexOf('Leslie'));
    expect(summarizeSalesReps([])).toBe('Tidak ada sales rep untuk filter ini.');
  });

  it('kantor: menyebut kota, territory, penjualan, dan customer', () => {
    const offices: OfficeRow[] = [
      { officeCode: '4', city: 'Paris', country: 'France', territory: 'EMEA', customers: 29, sales: 3083761.58 },
      { officeCode: '5', city: 'Tokyo', country: 'Japan', territory: '', customers: 5, sales: 457110.07 },
    ];
    const text = summarizeOffices(offices);
    expect(text).toContain('Paris (EMEA) penjualan US$3.083.761,58, 29 customer');
    expect(text).toContain('Tokyo (--) penjualan US$457.110,07, 5 customer');
    expect(summarizeOffices([])).toBe('Tidak ada kantor untuk filter ini.');
  });

  it('segmen credit limit memakai label dari BE apa adanya', () => {
    const text = summarizeCreditSegments(SEGMENTS);
    expect(text).toContain('Tanpa limit (0) 24 customer');
    expect(text).toContain('10.000-75.000 36 customer');
    expect(text).toContain('> 75.000 62 customer');
    expect(summarizeCreditSegments(SEGMENTS.map((s) => ({ ...s, customers: 0 })))).toBe('Tidak ada customer untuk filter ini.');
  });
});
