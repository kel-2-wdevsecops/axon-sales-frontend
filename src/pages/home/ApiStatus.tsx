import { Spinner } from '@/components/ui/Spinner';
import { useHealth } from '@/hooks/useHealth';
import { APP_VERSION } from '@/lib/appVersion';

/** Status API dan versi aplikasi, ringkas di kaki halaman (dulu panel "Status" di Beranda kerangka). */
export function ApiStatus() {
  const health = useHealth();

  return (
    <footer className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 text-[12px] text-ink-muted">
      {health.isLoading ? (
        <Spinner compact />
      ) : (
        <>
          <span>API: {health.data ? `Sehat, v${health.data.version}` : 'Tidak terjangkau'}</span>
          <span>Aplikasi web: v{APP_VERSION}</span>
        </>
      )}
    </footer>
  );
}
