import { normalizeFilter, PAGE_FILTER_KEYS } from '@/lib/filters';
import type { CustomersFilter, GrowthFilter, OperationsFilter, OverviewFilter, ProductsFilter } from '@/types';

// Semua queryKey react-query berasal dari sini; jangan menulis array literal
// di hook/komponen. Key statis = `as const` array, key berparameter = fungsi,
// mis. `overview: (filter: OverviewFilter) => ['dashboard-overview', filter] as const`.
// Filter dinormalisasi dulu supaya dua URL yang setara memakai entri cache yang sama.
export const queryKeys = {
  health: ['health'] as const,
  filters: ['dashboard-filters'] as const,
  overview: (filter: OverviewFilter) =>
    ['dashboard-overview', normalizeFilter(filter, { keys: PAGE_FILTER_KEYS.overview })] as const,
  products: (filter: ProductsFilter) =>
    ['dashboard-products', normalizeFilter(filter, { keys: PAGE_FILTER_KEYS.products })] as const,
  growth: (filter: GrowthFilter) =>
    ['dashboard-growth', normalizeFilter(filter, { keys: PAGE_FILTER_KEYS.growth })] as const,
  customers: (filter: CustomersFilter) =>
    ['dashboard-customers', normalizeFilter(filter, { keys: PAGE_FILTER_KEYS.customers })] as const,
  operations: (filter: OperationsFilter) =>
    ['dashboard-operations', normalizeFilter(filter, { keys: PAGE_FILTER_KEYS.operations })] as const,
  // Tanpa filter: satu entri cache untuk seluruh aplikasi.
  insights: ['dashboard-insights'] as const,
};
