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

/** Subset filter yang diterima GET /dashboard/products. */
export type ProductsFilter = Pick<DashboardFilter, 'year' | 'month' | 'productLine'>;

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


/** Satu baris tabel produk dari GET /dashboard/products. */
export interface ProductRow {
  productCode: string;
  productName: string;
  productLine: string;
  sales: number;
  profit: number;
  quantity: number;
  /** Order berbeda yang memuat produk ini. */
  orders: number;
  quantityInStock: number;
  /** Ditentukan BE (ambang stok ada di BE); FE hanya menandai. */
  lowStock: boolean;
}

/** GET /api/v1/dashboard/products */
export interface Products {
  kpi: {
    sales: number;
    profit: number;
    /** null bila penjualan 0 (mis. filter tanpa order). */
    profitMarginPct: number | null;
    /** Order berbeda; TIDAK sama dengan jumlah order per product line (satu order bisa memuat beberapa). */
    orders: number;
    quantity: number;
  };
  /** Urut penjualan menurun (urutan dari BE dipertahankan). */
  salesByProductLine: { productLine: string; sales: number; profit: number }[];
  ordersByYear: { year: number; orders: number }[];
  /** Selalu 12 baris, bulan 1-12 (bulan tanpa order = 0). */
  ordersByMonth: { month: number; orders: number }[];
  topVendors: { vendor: string; sales: number }[];
  /** Semua produk pada product line terpilih, termasuk yang penjualannya 0. */
  products: ProductRow[];
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

/** Subset filter yang diterima GET /dashboard/customers: tahun dan geografi (tanpa bulan). */
export type CustomersFilter = Pick<DashboardFilter, 'year' | 'continent' | 'country'>;

/** Satu customer pada Top 10. Hanya nama perusahaan dan negara: tanpa kontak, alamat, atau credit limit. */
export interface TopCustomerRow {
  customerNumber: number;
  customerName: string;
  country: string;
  sales: number;
  /** Order berbeda pada filter ini. */
  orders: number;
  /** Persen dari total penjualan pada filter yang sama (8.55 = 8,55%); null bila total penjualan 0. */
  sharePct: number | null;
}

/** Satu sales rep. Termasuk rep yang belum memegang customer (customers/orders/sales = 0). */
export interface SalesRepRow {
  employeeNumber: number;
  name: string;
  /** Kota kantor. */
  office: string;
  /** Customer yang dipegang saat ini; tidak terpengaruh filter tahun. */
  customers: number;
  orders: number;
  sales: number;
}

/** Satu kantor. Selalu semua kantor tampil, nilainya mengikuti customer yang lolos filter geografi. */
export interface OfficeRow {
  officeCode: string;
  city: string;
  country: string;
  territory: string;
  /** Tidak terpengaruh filter tahun. */
  customers: number;
  sales: number;
}

export type CreditSegmentKey = 'none' | 'low' | 'medium' | 'high';

/** Jumlah customer per segmen credit limit; label segmen datang dari BE. */
export interface CreditSegmentRow {
  segment: CreditSegmentKey;
  label: string;
  customers: number;
}

/** GET /api/v1/dashboard/customers */
export interface Customers {
  kpi: {
    /** Customer terdaftar: tidak terpengaruh filter tahun. */
    customers: number;
    /** Customer dengan minimal satu order pada filter ini. */
    activeCustomers: number;
    /** Customer yang belum pernah order sama sekali: tidak terpengaruh filter tahun. */
    prospects: number;
    /** Tidak terpengaruh filter tahun. */
    withoutSalesRep: number;
    /** null bila tidak ada order pada filter ini. */
    avgOrderValue: number | null;
  };
  /** Maksimal 10, urut penjualan menurun. */
  topCustomers: TopCustomerRow[];
  /** Urut penjualan menurun. */
  salesReps: SalesRepRow[];
  /** Urut penjualan menurun. */
  offices: OfficeRow[];
  /** Empat segmen; hanya agregat jumlah, tidak terpengaruh filter tahun. */
  creditSegments: CreditSegmentRow[];
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

/** Subset filter yang diterima GET /dashboard/operations. `status` hanya memengaruhi `statusBreakdown` dan `attentionOrders`. */
export type OperationsFilter = Pick<DashboardFilter, 'year' | 'status'>;

/** Wadah lama pengiriman (hari dari tanggal order ke tanggal kirim), selalu empat wadah berurutan dari BE. */
export type ShippingBucket = '0-2' | '3-5' | '6-10' | '>10';

/** Satu order yang perlu perhatian (status On Hold, Disputed, atau In Process). */
export interface AttentionOrder {
  orderNumber: number;
  /** 'YYYY-MM-DD' */
  orderDate: string;
  /** 'YYYY-MM-DD' */
  requiredDate: string;
  status: string;
  customerName: string;
  sales: number;
  /** Teks bebas dari BE, dikirim apa adanya (bisa berisi karakter HTML). Render hanya sebagai teks biasa. */
  comments: string | null;
}

/** GET /api/v1/dashboard/operations. Semua angka dihitung BE; FE tidak menghitung ulang. */
export interface Operations {
  /** Tanggal order terakhir di data ('YYYY-MM-DD'), bukan tanggal hari ini; null bila tabel order kosong. */
  asOf: string | null;
  /** Hanya terpengaruh filter `year`. */
  kpi: {
    orders: number;
    shipped: number;
    /** On Hold + Disputed + In Process. */
    needsAttention: number;
    /** Belum dikirim, bukan Cancelled, tenggat sebelum `asOf`. */
    overdue: number;
    /** Dikirim setelah tenggat. */
    lateShipments: number;
    /** Rata-rata hari dari order ke kirim; null bila belum ada pengiriman. */
    avgShipDays: number | null;
  };
  /** Urut penjualan menurun (urutan dari BE dipertahankan). */
  statusBreakdown: { status: string; orders: number; sales: number }[];
  /** Urut tenggat naik, lalu nomor order. */
  attentionOrders: AttentionOrder[];
  shippingLeadTime: { bucket: ShippingBucket; orders: number }[];
  /** Maksimal 5 baris, urut hari menurun. */
  slowestShipments: { orderNumber: number; customerName: string; days: number }[];
}
