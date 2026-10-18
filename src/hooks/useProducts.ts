import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';
import type { ProductsFilter } from '@/types';

interface UseProductsOptions {
  /** Tahan permintaan, mis. sampai pilihan filter termuat dan filter dari URL sudah divalidasi. */
  enabled?: boolean;
}

/**
 * Analisis produk (GET /dashboard/products) untuk `filter` dari
 * `useDashboardFilter('products')`. Data tidak berubah selama sesi, jadi tidak
 * pernah basi; saat filter berganti, tampilan sebelumnya tetap ada
 * (`isPlaceholderData`) sampai data baru datang.
 */
export const useProducts = (filter: ProductsFilter, { enabled = true }: UseProductsOptions = {}) =>
  useQuery({
    queryKey: queryKeys.products(filter),
    queryFn: () => api.products(filter),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled,
  });
