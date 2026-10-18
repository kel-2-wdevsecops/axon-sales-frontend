import { useCallback, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useFilterOptions } from '@/hooks/useFilterOptions';
import { PAGE_FILTER_KEYS, parseFilter, type FilterKey, type FilterPage, type FilterScope } from '@/lib/filters';
import { buildShareUrl, nextSearchParams, type FilterChange } from '@/lib/filterState';

/**
 * Filter aktif sebuah halaman, disimpan di query string URL (bukan di store)
 * supaya tampilan bisa dibagikan sebagai tautan.
 *
 * - Dibaca lewat `parseFilter`: hanya parameter yang berlaku di `page` dan
 *   bernilai valid. Setelah pilihan dari BE termuat, nilai di luar daftar dan
 *   negara yang bukan bagian benua terpilih ikut dibuang.
 * - URL yang berisi nilai rusak/tidak berlaku/tidak berurutan diganti
 *   (`replace`) dengan versi bersih, sehingga tautan rusak tidak pernah jadi
 *   halaman error dan tidak menambah riwayat.
 * - Perubahan dari pengguna (`setFilter`, `removeFilter`, `reset`) memakai
 *   `push`, jadi tombol Kembali browser membatalkan perubahan filter.
 */
export function useDashboardFilter(page: FilterPage) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const optionsQuery = useFilterOptions();
  const options = optionsQuery.data;
  const keys: readonly FilterKey[] = PAGE_FILTER_KEYS[page];

  const scope = useMemo<FilterScope>(() => ({ keys, options }), [keys, options]);
  const filter = useMemo(() => parseFilter(searchParams, scope), [searchParams, scope]);

  // Versi bersih dari URL sekarang; dihitung di render, bukan di effect.
  const cleanSearch = useMemo(() => nextSearchParams(searchParams, {}, scope).toString(), [searchParams, scope]);
  const currentSearch = searchParams.toString();
  useEffect(() => {
    if (cleanSearch !== currentSearch) setSearchParams(new URLSearchParams(cleanSearch), { replace: true });
  }, [cleanSearch, currentSearch, setSearchParams]);

  /** Ubah sebagian filter; `null` menghapus satu parameter. */
  const setFilter = useCallback(
    (change: FilterChange) => {
      const next = nextSearchParams(searchParams, change, scope);
      if (next.toString() !== currentSearch) setSearchParams(next);
    },
    [searchParams, currentSearch, scope, setSearchParams],
  );

  /** Hapus semua filter halaman ini. */
  const reset = useCallback(() => {
    setFilter(Object.fromEntries(keys.map((key) => [key, null])));
  }, [keys, setFilter]);

  /** Tautan berbagi untuk tampilan sekarang (URL kanonik, tanpa parameter asing). */
  const getShareUrl = useCallback(
    () => buildShareUrl(`${window.location.origin}${pathname}`, filter, scope),
    [pathname, filter, scope],
  );

  return {
    filter,
    /** Kunci filter yang berlaku di halaman ini. */
    keys,
    /** Pilihan dari BE; `undefined` selama memuat atau bila gagal. */
    options,
    optionsLoading: optionsQuery.isLoading,
    optionsError: optionsQuery.error,
    refetchOptions: optionsQuery.refetch,
    hasFilter: Object.keys(filter).length > 0,
    setFilter,
    reset,
    getShareUrl,
  };
}
