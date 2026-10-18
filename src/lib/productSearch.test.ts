import { describe, expect, it } from 'vitest';
import type { ProductRow } from '@/types';
import { DEFAULT_PRODUCT_SORT, nextProductSort, searchProducts, sortProducts } from './productSearch';

const row = (over: Partial<ProductRow> & Pick<ProductRow, 'productCode' | 'productName'>): ProductRow => ({
  productLine: 'Classic Cars',
  sales: 0,
  profit: 0,
  quantity: 0,
  orders: 0,
  quantityInStock: 500,
  lowStock: false,
  ...over,
});

// Bentuk mengikuti contoh di docs/features/F02-produk.md (angka acuan BE).
const FERRARI = row({ productCode: 'S18_3232', productName: '1992 Ferrari 360 Spider red', sales: 276839.98, profit: 135996.78, quantity: 1808, orders: 53, quantityInStock: 8347 });
const MUSTANG = row({ productCode: 'S18_2795', productName: '1968 Ford Mustang', productLine: 'Classic Cars', sales: 161531.48, profit: 70000, quantity: 933, orders: 40, quantityInStock: 68, lowStock: true });
const SUPRA = row({ productCode: 'S18_3233', productName: '1985 Toyota Supra', productLine: 'Classic Cars' });
const ZERO = row({ productCode: 'S10_0001', productName: '1900s Vintage Bi-Plane', productLine: 'Planes' });
const ALL = [SUPRA, MUSTANG, FERRARI, ZERO];

describe('searchProducts', () => {
  it('tanpa membedakan huruf besar/kecil', () => {
    expect(searchProducts(ALL, 'FERRARI')).toEqual([FERRARI]);
    expect(searchProducts(ALL, 'ferrari')).toEqual([FERRARI]);
  });

  it('spasi di awal dan akhir diabaikan', () => {
    expect(searchProducts(ALL, '  mustang \t')).toEqual([MUSTANG]);
  });

  it('cocok di bagian mana pun dari nama', () => {
    expect(searchProducts(ALL, '360 spider')).toEqual([FERRARI]);
    expect(searchProducts(ALL, '19')).toHaveLength(4);
  });

  it('kata kunci kosong atau spasi saja mengembalikan semua produk (salinan, urutan tetap)', () => {
    for (const query of ['', '   ']) {
      const result = searchProducts(ALL, query);
      expect(result).toEqual(ALL);
      expect(result).not.toBe(ALL);
    }
  });

  it('tanpa hasil -> larik kosong', () => {
    expect(searchProducts(ALL, 'tidak ada produk ini')).toEqual([]);
  });

  it('hanya mencari di nama produk, bukan product line atau kode', () => {
    expect(searchProducts(ALL, 'Planes')).toEqual([]);
    expect(searchProducts(ALL, 'S18_3232')).toEqual([]);
  });

  it('karakter khusus regex diperlakukan sebagai teks biasa', () => {
    expect(searchProducts(ALL, '.*')).toEqual([]);
    expect(searchProducts(ALL, '(')).toEqual([]);
  });
});

describe('sortProducts', () => {
  it('urutan awal: penjualan menurun, produk tanpa penjualan di bawah', () => {
    const sorted = sortProducts(ALL, DEFAULT_PRODUCT_SORT);
    expect(sorted.map((r) => r.productCode)).toEqual(['S18_3232', 'S18_2795', 'S10_0001', 'S18_3233']);
  });

  it('seri diurutkan menurut kode produk (naik) agar stabil, apa pun arahnya', () => {
    const desc = sortProducts(ALL, { key: 'sales', direction: 'desc' });
    const asc = sortProducts(ALL, { key: 'sales', direction: 'asc' });
    // SUPRA (S18_3233) dan ZERO (S10_0001) sama-sama 0.
    expect(desc.slice(2).map((r) => r.productCode)).toEqual(['S10_0001', 'S18_3233']);
    expect(asc.slice(0, 2).map((r) => r.productCode)).toEqual(['S10_0001', 'S18_3233']);
  });

  it('teks naik/turun, tanpa membedakan huruf besar/kecil', () => {
    const names = (direction: 'asc' | 'desc') => sortProducts(ALL, { key: 'productName', direction }).map((r) => r.productName);
    expect(names('asc')).toEqual(['1900s Vintage Bi-Plane', '1968 Ford Mustang', '1985 Toyota Supra', '1992 Ferrari 360 Spider red']);
    expect(names('desc')).toEqual([...names('asc')].reverse());
  });

  it('angka di dalam nama dibandingkan sebagai angka', () => {
    const rows = [row({ productCode: 'A', productName: 'Model 10' }), row({ productCode: 'B', productName: 'Model 2' })];
    expect(sortProducts(rows, { key: 'productName', direction: 'asc' }).map((r) => r.productName)).toEqual(['Model 2', 'Model 10']);
  });

  it('stok naik menaruh stok terendah di atas', () => {
    const sorted = sortProducts(ALL, { key: 'quantityInStock', direction: 'asc' });
    expect(sorted[0]).toBe(MUSTANG);
  });

  it('setiap kolom angka bisa diurutkan', () => {
    for (const key of ['sales', 'profit', 'quantity', 'orders', 'quantityInStock'] as const) {
      const values = sortProducts(ALL, { key, direction: 'desc' }).map((r) => r[key]);
      expect(values).toEqual([...values].sort((a, b) => b - a));
    }
  });

  it('product line sebagai teks', () => {
    expect(sortProducts(ALL, { key: 'productLine', direction: 'desc' })[0]).toBe(ZERO);
  });

  it('tidak mengubah larik masukan', () => {
    const input = [...ALL];
    sortProducts(input, { key: 'profit', direction: 'asc' });
    expect(input).toEqual(ALL);
  });

  it('larik kosong aman', () => {
    expect(sortProducts([], DEFAULT_PRODUCT_SORT)).toEqual([]);
  });
});

describe('nextProductSort', () => {
  it('mengklik kolom aktif membalik arah', () => {
    expect(nextProductSort({ key: 'sales', direction: 'desc' }, 'sales')).toEqual({ key: 'sales', direction: 'asc' });
    expect(nextProductSort({ key: 'sales', direction: 'asc' }, 'sales')).toEqual({ key: 'sales', direction: 'desc' });
  });

  it('kolom angka baru mulai dari terbesar, kolom teks dari A-Z', () => {
    expect(nextProductSort(DEFAULT_PRODUCT_SORT, 'quantityInStock')).toEqual({ key: 'quantityInStock', direction: 'desc' });
    expect(nextProductSort(DEFAULT_PRODUCT_SORT, 'productName')).toEqual({ key: 'productName', direction: 'asc' });
    expect(nextProductSort(DEFAULT_PRODUCT_SORT, 'productLine')).toEqual({ key: 'productLine', direction: 'asc' });
  });
});
