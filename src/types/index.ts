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

/** Subset filter yang diterima GET /dashboard/growth: hanya `year`, dan hanya memilih baris yang ditampilkan. */
export type GrowthFilter = Pick<DashboardFilter, 'year'>;

/** Satu periode pada tabel pertumbuhan. Semua angka dihitung BE; FE tidak menghitung ulang. */
export interface GrowthPoint {
  year: number;
  sales: number;
  /** Penjualan periode kalender tepat sebelumnya; null bila periode itu sebelum data dimulai. */
  previous: number | null;
  /** Persen (36.13 = +36,13%); null bila tidak ada pembanding atau pembanding 0. */
  growthPct: number | null;
  /** Periode berakhir setelah order terakhir (`dataRange.to`). */
  isPartial: boolean;
}

export interface GrowthQuarterPoint extends GrowthPoint {
  /** 1-4 */
  quarter: number;
}

export interface GrowthMonthPoint extends GrowthPoint {
  /** 1-12 */
  month: number;
}

/** Januari s.d. bulan terakhir data pada tahun terakhir vs rentang yang sama setahun sebelumnya. */
export interface YearToDate {
  year: number;
  throughMonth: number;
  sales: number;
  previous: number;
  growthPct: number | null;
}

/** GET /api/v1/dashboard/growth */
export interface Growth {
  /** 'YYYY-MM-DD'; null bila tabel order kosong. */
  dataRange: { from: string | null; to: string | null };
  /** Tidak terpengaruh filter; null bila tidak ada data. */
  ytd: YearToDate | null;
  yearly: GrowthPoint[];
  quarterly: GrowthQuarterPoint[];
  monthly: GrowthMonthPoint[];
  salesProfitByYear: { year: number; sales: number; profit: number }[];
}
