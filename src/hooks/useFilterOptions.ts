import { useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { queryKeys } from '@/api/queryKeys';

/**
 * Pilihan filter (GET /dashboard/filters): tahun, benua, negara, product line,
 * status, dan rentang data. Isinya tidak berubah selama sesi, jadi tidak
 * pernah dianggap basi.
 */
export const useFilterOptions = () =>
  useQuery({ queryKey: queryKeys.filters, queryFn: api.filters, staleTime: Infinity });
