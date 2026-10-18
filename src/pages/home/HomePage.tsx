import { FilterBar } from '@/components/filters/FilterBar';
import { PageHeader } from '@/components/layout/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { useHealth } from '@/hooks/useHealth';
import { APP_VERSION } from '@/lib/appVersion';

/**
 * Halaman awal kerangka: memastikan FE tersambung ke BE. Ganti dengan
 * halaman dashboard pertama (lihat "Menambah halaman" di README).
 */
export function HomePage() {
  const health = useHealth();

  return (
    <>
      <PageHeader title="Axon Sales Dashboard" subtitle="Kerangka aplikasi: halaman dashboard dibangun di src/pages" />

      {/* Dipasang di sini agar bisa dicoba selama F01 belum ada; tiap halaman memasang
          FilterBar dengan skemanya sendiri (lihat PAGE_FILTER_KEYS). */}
      <FilterBar page="overview" />

      <section className="flex flex-col gap-2 rounded-xl border border-line bg-white px-4 py-3.5 text-[13px]">
        <h2 className="m-0 text-[14px] font-semibold">Status</h2>
        {health.isLoading ? (
          <Spinner compact />
        ) : (
          <dl className="m-0 grid grid-cols-[120px_1fr] gap-y-1.5">
            <dt className="text-ink-muted">API</dt>
            <dd className="m-0">{health.data ? `Sehat, v${health.data.version}` : 'Tidak terjangkau'}</dd>
            <dt className="text-ink-muted">Aplikasi web</dt>
            <dd className="m-0">v{APP_VERSION}</dd>
          </dl>
        )}
      </section>
    </>
  );
}
