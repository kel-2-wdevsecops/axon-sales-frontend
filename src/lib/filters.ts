import type { DashboardFilter, FilterOptions } from '@/types';

// Filter dashboard <-> query string URL. Fungsi murni: dipakai hook usePageFilters
// (membaca URL), lapisan api (membuang parameter yang ditolak BE), dan queryKeys
// (key cache yang stabil).

export type FilterKey = keyof DashboardFilter;

/** Urutan kanonik parameter di URL dan di key cache. */
export const FILTER_KEYS = ['year', 'month', 'continent', 'country', 'productLine', 'status'] as const satisfies readonly FilterKey[];

/**
 * Parameter yang diterima BE per halaman (DTO di BE `.strict()`: parameter
 * lain ditolak 422, jadi tidak boleh ikut terkirim). Sama dengan tabel
 * "Filter per Halaman" di docs/features/F06-filter-tautan.md.
 */
export const PAGE_FILTER_KEYS = {
  overview: ['year', 'month', 'continent', 'country'],
  products: ['year', 'month', 'productLine'],
  growth: ['year'],
  customers: ['year', 'continent', 'country'],
  operations: ['year', 'status'],
} as const satisfies Record<string, readonly FilterKey[]>;

export type FilterPage = keyof typeof PAGE_FILTER_KEYS;

export interface FilterScope {
  /** Parameter yang berlaku; sisanya dibuang. Default: semua. */
  keys?: readonly FilterKey[];
  /**
   * Daftar pilihan dari /dashboard/filters. Bila ada, nilai di luar daftar
   * dibuang dan negara yang bukan bagian benua terpilih ikut dibuang. Tanpa
   * ini hanya bentuk nilainya yang diperiksa (BE tetap menolak nilai asing).
   */
  options?: FilterOptions;
}

// Aturan bentuk yang sama dengan DTO BE (src/lib/querySchemas.ts).
const YEAR_MIN = 2000;
const YEAR_MAX = 2100;
const MONTH_MIN = 1;
const MONTH_MAX = 12;
const NAME_PATTERN = /^[A-Za-z &]+$/;
const NAME_MAX_LENGTH = 50;
const PRODUCT_LINE_MAX = 7;
const DIGITS_PATTERN = /^\d{1,4}$/;

function integerIn(value: number | undefined, min: number, max: number): number | undefined {
  return value !== undefined && Number.isInteger(value) && value >= min && value <= max ? value : undefined;
}

function nameOf(value: string | undefined): string | undefined {
  const text = value?.trim();
  return text && text.length <= NAME_MAX_LENGTH && NAME_PATTERN.test(text) ? text : undefined;
}

/**
 * Bersihkan filter: buang parameter yang tidak berlaku di halaman (`keys`),
 * nilai tidak valid, dan nilai kosong; `productLine` di-dedup dan diurutkan
 * (urutan yang sama dengan key cache BE). Hasilnya selalu berurutan kanonik,
 * jadi dua URL yang setara menghasilkan filter, key cache, dan query yang sama.
 */
export function normalizeFilter(filter: DashboardFilter, { keys = FILTER_KEYS, options }: FilterScope = {}): DashboardFilter {
  const use = new Set<FilterKey>(keys);
  const out: DashboardFilter = {};

  const year = integerIn(filter.year, YEAR_MIN, YEAR_MAX);
  if (use.has('year') && year !== undefined && (!options || options.years.includes(year))) out.year = year;

  const month = integerIn(filter.month, MONTH_MIN, MONTH_MAX);
  if (use.has('month') && month !== undefined) out.month = month;

  const continent = nameOf(filter.continent);
  if (use.has('continent') && continent && (!options || options.continents.includes(continent))) out.continent = continent;

  const country = nameOf(filter.country);
  if (use.has('country') && country) {
    if (!options) {
      out.country = country;
    } else {
      const known = options.countries.find((c) => c.country === country);
      // Negara di luar benua terpilih dibuang, benuanya dipertahankan.
      if (known && (out.continent === undefined || known.continent === out.continent)) out.country = country;
    }
  }

  if (use.has('productLine') && filter.productLine) {
    const allowed = options ? new Set(options.productLines) : null;
    const lines = [
      ...new Set(
        filter.productLine.flatMap((line) => {
          const name = nameOf(line);
          return name && (!allowed || allowed.has(name)) ? [name] : [];
        }),
      ),
    ]
      .sort()
      .slice(0, PRODUCT_LINE_MAX);
    if (lines.length > 0) out.productLine = lines;
  }

  const status = nameOf(filter.status);
  if (use.has('status') && status && (!options || options.statuses.includes(status))) out.status = status;

  return out;
}

function numberParam(params: URLSearchParams, key: string): number | undefined {
  const text = params.get(key)?.trim();
  // Ketat: "2004abc", "-1", "1e3", dan "" bukan angka.
  return text !== undefined && DIGITS_PATTERN.test(text) ? Number(text) : undefined;
}

/**
 * Baca filter dari query string. Tidak pernah melempar error: nilai asing,
 * parameter yang tidak berlaku di halaman, dan parameter lain di URL dibuang.
 * Nilai berulang selain `productLine` memakai kemunculan pertama.
 */
export function parseFilter(params: URLSearchParams, scope: FilterScope = {}): DashboardFilter {
  return normalizeFilter(
    {
      year: numberParam(params, 'year'),
      month: numberParam(params, 'month'),
      continent: params.get('continent') ?? undefined,
      country: params.get('country') ?? undefined,
      productLine: params.getAll('productLine'),
      status: params.get('status') ?? undefined,
    },
    scope,
  );
}

/**
 * Filter -> query string kanonik. `productLine` menjadi key berulang
 * (`productLine=A&productLine=B`), nilai kosong tidak ditulis.
 * Dibersihkan dengan aturan yang sama dengan `normalizeFilter`.
 */
export function serializeFilter(filter: DashboardFilter, scope: FilterScope = {}): URLSearchParams {
  const clean = normalizeFilter(filter, scope);
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = clean[key];
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else {
      params.set(key, String(value));
    }
  }
  return params;
}
