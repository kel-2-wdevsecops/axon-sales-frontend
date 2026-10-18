import type { DashboardFilter, FilterOptions } from '@/types';
import { FILTER_KEYS, normalizeFilter, parseFilter, serializeFilter, type FilterKey, type FilterScope } from './filters';
import { formatMonth } from './format';

// Logika murni di balik bilah filter (useDashboardFilter + FilterBar): mengubah
// filter, menulisnya ke query string, dan membuat teks tampilannya. Parsing dan
// normalisasi dasar ada di ./filters; file ini tidak menyentuh DOM atau React.

/**
 * Perubahan sebagian atas filter. `undefined` = biarkan, `null` = hapus
 * parameter itu. Contoh: `{ continent: 'Oceania', country: null }`.
 */
export type FilterChange = { [K in FilterKey]?: DashboardFilter[K] | null };

const FILTER_KEY_SET: ReadonlySet<string> = new Set(FILTER_KEYS);

/**
 * Terapkan `change` ke `current`, lalu bersihkan dengan aturan halaman (`scope`).
 * Karena hasilnya dinormalisasi, mengganti benua otomatis membuang negara yang
 * bukan bagian benua itu (selama `scope.options` ada).
 */
export function applyFilterChange(current: DashboardFilter, change: FilterChange, scope: FilterScope = {}): DashboardFilter {
  const merged: DashboardFilter = { ...current };
  for (const key of FILTER_KEYS) {
    const value = change[key];
    if (value === null) delete merged[key];
    else if (value !== undefined) Object.assign(merged, { [key]: value });
  }
  return normalizeFilter(merged, scope);
}

/**
 * Query string berikutnya setelah `change`. Hanya parameter filter yang
 * ditulis ulang (kanonik, tanpa nilai tidak valid); parameter lain di URL
 * dibiarkan. `change` kosong = membersihkan URL saja.
 */
export function nextSearchParams(prev: URLSearchParams, change: FilterChange, scope: FilterScope = {}): URLSearchParams {
  const filter = applyFilterChange(parseFilter(prev, scope), change, scope);
  const next = new URLSearchParams();
  for (const [key, value] of prev) {
    if (!FILTER_KEY_SET.has(key)) next.append(key, value);
  }
  for (const [key, value] of serializeFilter(filter, scope)) next.append(key, value);
  return next;
}

/** Tautan berbagi: `base` (origin + path) ditambah query kanonik dari `filter`. */
export function buildShareUrl(base: string, filter: DashboardFilter, scope: FilterScope = {}): string {
  const query = serializeFilter(filter, scope).toString();
  return query ? `${base}?${query}` : base;
}

/** Nama negara yang dipilihkan, menyempit menurut benua terpilih; urut abjad. */
export function countryChoices(options: FilterOptions, continent?: string): string[] {
  return options.countries
    .filter((c) => continent === undefined || c.continent === continent)
    .map((c) => c.country)
    .sort((a, b) => a.localeCompare(b, 'id'));
}

/** Nyalakan/matikan satu product line pada pilihan ganda; hasilnya salinan baru. */
export function toggleValue(list: readonly string[] | undefined, value: string): string[] {
  const current = list ?? [];
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

/** Satu chip "filter aktif" (tombol hapus). */
export interface FilterChip {
  /** Unik di antara chip, untuk key React. */
  id: string;
  /** Teks chip, mis. "Tahun 2004". */
  label: string;
  /** Untuk pembaca layar, mis. "Hapus filter Tahun 2004". */
  ariaLabel: string;
  /** Perubahan yang menghapus chip ini. */
  change: FilterChange;
}

function chip(id: string, label: string, change: FilterChange): FilterChip {
  return { id, label, ariaLabel: `Hapus filter ${label}`, change };
}

/** Chip untuk tiap filter aktif; product line satu chip per nilai. Urutan = urutan URL. */
export function activeChips(filter: DashboardFilter): FilterChip[] {
  const chips: FilterChip[] = [];
  if (filter.year !== undefined) chips.push(chip('year', `Tahun ${filter.year}`, { year: null }));
  if (filter.month !== undefined) chips.push(chip('month', `Bulan ${formatMonth(filter.month)}`, { month: null }));
  if (filter.continent) chips.push(chip('continent', `Benua ${filter.continent}`, { continent: null }));
  if (filter.country) chips.push(chip('country', `Negara ${filter.country}`, { country: null }));
  for (const line of filter.productLine ?? []) {
    const rest = (filter.productLine ?? []).filter((item) => item !== line);
    chips.push(chip(`productLine:${line}`, `Product line ${line}`, { productLine: rest }));
  }
  if (filter.status) chips.push(chip('status', `Status ${filter.status}`, { status: null }));
  return chips;
}

/** Kalimat pengumuman untuk region aria-live, mis. "Menampilkan data tahun 2004, negara USA." */
export function summarizeFilter(filter: DashboardFilter): string {
  const parts: string[] = [];
  if (filter.year !== undefined) parts.push(`tahun ${filter.year}`);
  if (filter.month !== undefined) {
    parts.push(filter.year === undefined ? `bulan ${formatMonth(filter.month)} di semua tahun` : `bulan ${formatMonth(filter.month)}`);
  }
  if (filter.continent) parts.push(`benua ${filter.continent}`);
  if (filter.country) parts.push(`negara ${filter.country}`);
  if (filter.productLine?.length) parts.push(`product line ${filter.productLine.join(', ')}`);
  if (filter.status) parts.push(`status ${filter.status}`);
  return parts.length > 0 ? `Menampilkan data ${parts.join(', ')}.` : 'Menampilkan semua data.';
}
