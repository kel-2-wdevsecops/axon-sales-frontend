import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';
import type { GrowthFilter } from '@/types';

interface UseGrowthOptions {
  /** Tahan permintaan, mis. sampai pilihan filter termuat dan filter dari URL sudah divalidasi. */
  enabled?: boolean;
}

/**
 * Analisis pertumbuhan (GET /dashboard/growth) untuk `filter` dari
 * `useDashboardFilter('growth')`. Data tidak berubah selama sesi, jadi tidak
 * pernah basi; saat tahun berganti, tabel sebelumnya tetap tampil
 * (`isPlaceholderData`) sampai data baru datang.
 */
export const useGrowth = (filter: GrowthFilter, { enabled = true }: UseGrowthOptions = {}) =>
  useQuery({
    queryKey: queryKeys.growth(filter),
    queryFn: () => api.growth(filter),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled,
  });
