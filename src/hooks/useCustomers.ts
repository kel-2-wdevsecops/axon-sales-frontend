import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';
import type { CustomersFilter } from '@/types';

interface UseCustomersOptions {
  /** Tahan permintaan, mis. sampai pilihan filter termuat dan filter dari URL sudah divalidasi. */
  enabled?: boolean;
}

/**
 * Pelanggan dan tim sales (GET /dashboard/customers) untuk `filter` dari
 * `useDashboardFilter('customers')`. Data tidak berubah selama sesi, jadi tidak
 * pernah basi; saat filter berganti, tampilan sebelumnya tetap ada
 * (`isPlaceholderData`) sampai data baru datang.
 */
export const useCustomers = (filter: CustomersFilter, { enabled = true }: UseCustomersOptions = {}) =>
  useQuery({
    queryKey: queryKeys.customers(filter),
    queryFn: () => api.customers(filter),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled,
  });
