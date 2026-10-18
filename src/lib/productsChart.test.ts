import { describe, expect, it } from 'vitest';
import type { Products } from '@/types';
import {
  hasNoOrders,
  isProductsEmpty,
  summarizeOrdersByMonth,
  summarizeOrdersByYear,
  summarizeSalesByProductLine,
  summarizeTopVendors,
  toMonthColumns,
  toYearOrderColumns,
  truncateLabel,
} from './productsChart';

// Dari dokumen F02 hanya Januari = 25 dan November = 63 (tertinggi) yang angka
// acuan; bulan lain adalah contoh bentuk data, bukan angka golden BE.
const AXON_RANGE = { from: '2003-01-06', to: '2005-05-31' };

const ORDERS_BY_MONTH: Products['ordersByMonth'] = [
  { month: 1, orders: 25 }, { month: 2, orders: 22 }, { month: 3, orders: 24 }, { month: 4, orders: 24 },
  { month: 5, orders: 33 }, { month: 6, orders: 22 }, { month: 7, orders: 21 }, { month: 8, orders: 23 },
  { month: 9, orders: 26 }, { month: 10, orders: 36 }, { month: 11, orders: 63 }, { month: 12, orders: 7 },
];

const emptyProducts = (over: Partial<Products> = {}): Products => ({
  kpi: { sales: 0, profit: 0, profitMarginPct: null, orders: 0, quantity: 0 },
  salesByProductLine: [],
  ordersByYear: [],
  ordersByMonth: Array.from({ length: 12 }, (_, i) => ({ month: i + 1, orders: 0 })),
  topVendors: [],
  products: [],
  ...over,
});

describe('toMonthColumns', () => {
  it('12 kolom urutan kalender Januari-Desember, label singkat Indonesia', () => {
    const columns = toMonthColumns(ORDERS_BY_MONTH);
    expect(columns).toHaveLength(12);
    expect(columns.map((c) => c.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(columns[0]).toMatchObject({ label: 'Jan', fullLabel: 'Januari', orders: 25 });
    expect(columns[4].label).toBe('Mei');
    expect(columns[7].label).toBe('Agu');
    expect(columns[10]).toMatchObject({ fullLabel: 'November', orders: 63 });
  });

  it('urutan masukan acak tetap keluar menurut kalender (bukan menurut jumlah order)', () => {
    const shuffled = [...ORDERS_BY_MONTH].reverse();
    expect(toMonthColumns(shuffled).map((c) => c.orders)).toEqual(ORDERS_BY_MONTH.map((r) => r.orders));
  });

  it('bulan yang tidak dikirim tetap tampil sebagai 0', () => {
    const columns = toMonthColumns([{ month: 11, orders: 63 }]);
    expect(columns).toHaveLength(12);
    expect(columns.filter((c) => c.orders === 0)).toHaveLength(11);
    expect(columns[10].orders).toBe(63);
  });

  it('bulan di luar 1-12 diabaikan', () => {
    const columns = toMonthColumns([{ month: 0, orders: 9 }, { month: 13, orders: 9 }]);
    expect(columns.every((c) => c.orders === 0)).toBe(true);
  });

  it('tidak menambah order sendiri: jumlah kolom = jumlah masukan', () => {
    const total = (rows: { orders: number }[]) => rows.reduce((n, r) => n + r.orders, 0);
    expect(total(toMonthColumns(ORDERS_BY_MONTH))).toBe(total(ORDERS_BY_MONTH));
  });
});

describe('toYearOrderColumns', () => {
  const rows: Products['ordersByYear'] = [
    { year: 2005, orders: 52 },
    { year: 2003, orders: 111 },
    { year: 2004, orders: 163 },
  ];

  it('urut tahun naik; tahun parsial berlabel periodenya', () => {
    const columns = toYearOrderColumns(rows, AXON_RANGE);
    expect(columns.map((c) => c.label)).toEqual(['2003', '2004', '2005 (Jan-Mei)']);
    expect(columns.map((c) => c.orders)).toEqual([111, 163, 52]);
  });

  it('rentang data belum ada -> label hanya tahun', () => {
    expect(toYearOrderColumns(rows, undefined).map((c) => c.label)).toEqual(['2003', '2004', '2005']);
  });

  it('tidak mengubah masukan', () => {
    const input = [...rows];
    toYearOrderColumns(input, AXON_RANGE);
    expect(input).toEqual(rows);
  });
});

describe('truncateLabel', () => {
  it('label pendek dibiarkan', () => {
    expect(truncateLabel('Exoto Designs')).toBe('Exoto Designs');
  });

  it('label panjang dipotong dengan elipsis dalam batas panjang', () => {
    const out = truncateLabel('Classic Metal Creations', 18);
    expect(out).toBe('Classic Metal Cre…');
    expect([...out]).toHaveLength(18);
  });

  it('batas tidak masuk akal tidak melempar error', () => {
    expect(truncateLabel('Abcdef', 0)).toBe('A…');
  });
});

describe('isProductsEmpty / hasNoOrders', () => {
  it('benar-benar kosong bila tanpa produk, order, dan penjualan', () => {
    expect(isProductsEmpty(emptyProducts())).toBe(true);
  });

  it('produk ada tanpa order (filter waktu di luar data): bukan kosong total', () => {
    const data = emptyProducts({
      products: [
        { productCode: 'S18_3233', productName: '1985 Toyota Supra', productLine: 'Classic Cars', sales: 0, profit: 0, quantity: 0, orders: 0, quantityInStock: 100, lowStock: false },
      ],
    });
    expect(isProductsEmpty(data)).toBe(false);
    expect(hasNoOrders(data)).toBe(true);
  });

  it('ada order -> tidak kosong', () => {
    const data = emptyProducts({ kpi: { sales: 1, profit: 1, profitMarginPct: 100, orders: 1, quantity: 1 } });
    expect(isProductsEmpty(data)).toBe(false);
    expect(hasNoOrders(data)).toBe(false);
  });
});

describe('ringkasan teks', () => {
  it('product line: urutan dari BE dipertahankan, angka format Indonesia', () => {
    const text = summarizeSalesByProductLine([
      { productLine: 'Classic Cars', sales: 3853922.49, profit: 1526212.2 },
      { productLine: 'Vintage Cars', sales: 1797559.63, profit: 700000 },
    ]);
    expect(text).toContain('Classic Cars penjualan US$3.853.922,49, profit US$1.526.212,20');
    expect(text.indexOf('Classic Cars')).toBeLessThan(text.indexOf('Vintage Cars'));
    expect(summarizeSalesByProductLine([])).toBe('Tidak ada penjualan untuk filter ini.');
  });

  it('order per bulan menyebut bulan teramai', () => {
    const text = summarizeOrdersByMonth(toMonthColumns(ORDERS_BY_MONTH));
    expect(text).toContain('Paling ramai November dengan 63 order');
    expect(text).toContain('Januari 25');
    expect(summarizeOrdersByMonth(toMonthColumns([]))).toBe('Tidak ada order untuk filter ini.');
  });

  it('order per tahun dan vendor', () => {
    expect(summarizeOrdersByYear(toYearOrderColumns([{ year: 2003, orders: 111 }], AXON_RANGE))).toBe('Order per tahun: 2003 111.');
    expect(summarizeOrdersByYear([])).toBe('Tidak ada order untuk filter ini.');
    expect(summarizeTopVendors([{ vendor: 'Classic Metal Creations', sales: 934554.42 }])).toBe(
      '1 vendor teratas menurut penjualan: Classic Metal Creations US$934.554,42.',
    );
    expect(summarizeTopVendors([])).toBe('Tidak ada penjualan untuk filter ini.');
  });
});
