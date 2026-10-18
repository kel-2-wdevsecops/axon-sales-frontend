import type { ProductRow } from '@/types';

// Pencarian dan pengurutan tabel produk (F02). Fungsi murni: tidak mengubah
// larik masukan dan tidak menghitung ulang angka dari BE.

/** Kolom tabel produk yang bisa diurutkan (sama dengan field ProductRow). */
export type ProductSortKey = 'productName' | 'productLine' | 'sales' | 'profit' | 'quantity' | 'orders' | 'quantityInStock';

export type SortDirection = 'asc' | 'desc';

export interface ProductSort {
  key: ProductSortKey;
  direction: SortDirection;
}

/** Urutan awal tabel: penjualan terbesar di atas (sama dengan urutan BE). */
export const DEFAULT_PRODUCT_SORT: ProductSort = { key: 'sales', direction: 'desc' };

const TEXT_KEYS: ReadonlySet<ProductSortKey> = new Set<ProductSortKey>(['productName', 'productLine']);

/** Arah awal saat kolom dipilih: teks A-Z (naik), angka dari terbesar (menurun). */
export function defaultSortDirection(key: ProductSortKey): SortDirection {
  return TEXT_KEYS.has(key) ? 'asc' : 'desc';
}

/**
 * Cari produk menurut nama: tanpa membedakan huruf besar/kecil, spasi di
 * awal/akhir diabaikan. Kata kunci kosong mengembalikan semua produk.
 */
export function searchProducts<T extends Pick<ProductRow, 'productName'>>(rows: readonly T[], query: string): T[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return [...rows];
  return rows.filter((row) => row.productName.toLowerCase().includes(needle));
}

/**
 * Urutkan produk. Hasil seri diurutkan menurut `productCode` (naik) agar urutan
 * stabil dan sama setiap render. Teks memakai perbandingan locale Indonesia
 * (angka di dalam nama dibandingkan sebagai angka: "2 " sebelum "10 ").
 */
export function sortProducts<T extends ProductRow>(rows: readonly T[], sort: ProductSort = DEFAULT_PRODUCT_SORT): T[] {
  const factor = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const left = a[sort.key];
    const right = b[sort.key];
    const order =
      typeof left === 'string' && typeof right === 'string'
        ? left.localeCompare(right, 'id', { numeric: true, sensitivity: 'base' })
        : Number(left) - Number(right);
    return order * factor || a.productCode.localeCompare(b.productCode);
  });
}

/**
 * Urutan berikutnya setelah kolom `key` diklik. Kolom yang sedang aktif
 * dibalik arahnya; kolom baru mulai dari arah yang paling berguna (teks naik
 * A-Z, angka menurun dari terbesar).
 */
export function nextProductSort(current: ProductSort, key: ProductSortKey): ProductSort {
  if (current.key === key) return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  return { key, direction: defaultSortDirection(key) };
}
