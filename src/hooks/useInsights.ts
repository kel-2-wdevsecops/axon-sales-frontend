import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';

interface UseInsightsOptions {
  /** Tahan permintaan sampai dibutuhkan. */
  enabled?: boolean;
}

/**
 * Sorotan insight (GET /dashboard/insights). Tanpa filter, jadi tidak ikut
 * berubah saat filter halaman berganti. Data tidak berubah selama sesi, jadi
 * tidak pernah basi.
 */
export const useInsights = ({ enabled = true }: UseInsightsOptions = {}) =>
  useQuery({
    queryKey: queryKeys.insights,
    queryFn: () => api.insights(),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled,
  });
