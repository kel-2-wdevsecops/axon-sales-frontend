import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';
import type { OverviewFilter } from '@/types';

interface UseOverviewOptions {
  /** Tahan permintaan, mis. sampai pilihan filter termuat dan filter dari URL sudah divalidasi. */
  enabled?: boolean;
}

/**
 * Ringkasan penjualan (GET /dashboard/overview) untuk `filter` dari
 * `useDashboardFilter('overview')`. Data tidak berubah selama sesi, jadi tidak
 * pernah basi; saat filter berganti, grafik sebelumnya tetap tampil
 * (`isPlaceholderData`) sampai data baru datang.
 */
export const useOverview = (filter: OverviewFilter, { enabled = true }: UseOverviewOptions = {}) =>
  useQuery({
    queryKey: queryKeys.overview(filter),
    queryFn: () => api.overview(filter),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled,
  });
