// Bentuk data yang dipakai komponen. Satu-satunya sumber kebenaran tipe FE.
// Nama field mengikuti respons BE. Kalau suatu saat bentuk BE berbeda,
// terjemahkan di src/api/index.ts, jangan di komponen.

/** GET /api/v1/health */
export interface Health {
  status: 'ok';
  version: string;
  uptime: number;
}

/**
 * Filter dashboard. Nama field = nama parameter query string BE (dan URL FE).
 * Tiap endpoint hanya menerima sebagian (BE menolak parameter lain dengan 422),
 * lihat PAGE_FILTER_KEYS di src/lib/filters.ts. Benua, negara, product line,
 * dan status sengaja `string`: daftar nilainya datang dari /dashboard/filters.
 */
export interface DashboardFilter {
  year?: number;
  /** Tanpa `year` berarti bulan itu di semua tahun. */
  month?: number;
  continent?: string;
  country?: string;
  /** Pilihan ganda; dikirim sebagai key berulang. */
  productLine?: string[];
  status?: string;
}

/** Subset filter yang diterima GET /dashboard/overview. */
export type OverviewFilter = Pick<DashboardFilter, 'year' | 'month' | 'continent' | 'country'>;

/** GET /api/v1/dashboard/filters (tanpa parameter). */
export interface FilterOptions {
  /** 'YYYY-MM-DD'; null bila tabel order kosong. */
  dataRange: { from: string | null; to: string | null };
  years: number[];
  continents: string[];
  countries: { country: string; continent: string }[];
  productLines: string[];
  statuses: string[];
}

/** GET /api/v1/dashboard/overview */
export interface Overview {
  kpi: {
    sales: number;
    profit: number;
    /** null bila penjualan 0 (mis. filter tanpa order). */
    profitMarginPct: number | null;
    orders: number;
    /** Customer terdaftar: tidak terpengaruh filter waktu. */
    customers: number;
    activeCustomers: number;
    /** Selalu seluruh karyawan, tidak terpengaruh filter apa pun. */
    employees: number;
  };
  topCountriesBySales: { country: string; sales: number }[];
  customersByContinent: { continent: string; customers: number }[];
  /** Maksimal 27 baris, urut customers menurun lalu nama. */
  customersByCountry: { country: string; continent: string | null; customers: number }[];
  salesByYear: { year: number; sales: number; profit: number; isPartial: boolean }[];
}
