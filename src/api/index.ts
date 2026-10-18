import { http } from './http';
import { normalizeFilter, PAGE_FILTER_KEYS } from '@/lib/filters';
import type { FilterOptions, Health, Overview, OverviewFilter } from '@/types';

/**
 * Satu-satunya lapisan yang tahu endpoint BE. Alur wajib satu arah:
 * komponen -> hook (src/hooks) -> api.* (file ini) -> http.
 * Semua endpoint publik dan hanya-baca (GET).
 */
export const api = {
  health: () => http.get<Health>('/health'),

  /** Pilihan filter (tahun, benua, negara, product line, status). Tanpa parameter: BE menolak parameter apa pun. */
  filters: () => http.get<FilterOptions>('/dashboard/filters'),

  /** Hanya year/month/continent/country yang dikirim: BE menolak parameter lain dengan 422. */
  overview: (filter: OverviewFilter = {}) =>
    http.get<Overview>('/dashboard/overview', { ...normalizeFilter(filter, { keys: PAGE_FILTER_KEYS.overview }) }),
};
