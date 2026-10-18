import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';
import type { OperationsFilter } from '@/types';

interface UseOperationsOptions {
  /** Tahan permintaan, mis. sampai pilihan filter termuat dan filter dari URL sudah divalidasi. */
  enabled?: boolean;
}

/**
 * Operasional order (GET /dashboard/operations) untuk `filter` dari
 * `useDashboardFilter('operations')`. Data tidak berubah selama sesi, jadi
 * tidak pernah basi; saat filter berganti, tampilan sebelumnya tetap ada
 * (`isPlaceholderData`) sampai data baru datang.
 */
export const useOperations = (filter: OperationsFilter, { enabled = true }: UseOperationsOptions = {}) =>
  useQuery({
    queryKey: queryKeys.operations(filter),
    queryFn: () => api.operations(filter),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled,
  });
