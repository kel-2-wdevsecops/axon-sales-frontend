import { useLocation } from 'react-router-dom';
import { NAV } from '@/app/navigation';
import { AppVersion } from '@/components/ui/AppVersion';
import { useHealth } from '@/hooks/useHealth';
import { cn } from '@/lib/cn';
import { carryFilterSearch } from '@/lib/filters';
import { useUiStore } from '@/store/useUiStore';
import { SidebarNavItem } from './SidebarNavItem';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const open = useUiStore((s) => s.mobileSidebarOpen);
  const health = useHealth();
  // Filter di URL sekarang dibawa ke halaman tujuan (hanya yang berlaku di sana).
  const { search } = useLocation();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-70 flex h-screen w-[248px] shrink-0 flex-col gap-[18px] border-r border-line bg-white px-3.5 py-4 transition-transform duration-200 md:sticky md:top-0 md:z-auto md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      <div className="flex items-center gap-2.5 px-1.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-[13px] font-semibold text-white">
          AX
        </span>
        <div className="min-w-0">
          <div className="truncate text-[14.5px] font-semibold tracking-[-0.01em]">Axon Sales</div>
          <div className="mt-0.5 truncate text-[12px] text-ink-faint">Classic Cars Analysis</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5" aria-label="Halaman dashboard">
        {NAV.map((entry) => (
          <SidebarNavItem
            key={entry.to}
            to={entry.to}
            search={entry.page ? carryFilterSearch(search, entry.page) : undefined}
            label={entry.label}
            icon={entry.icon}
            onClick={onNavigate}
          />
        ))}
      </nav>

      <div className="flex-1" />

      <div className="flex flex-col gap-1 px-2.5 text-[11.5px] text-ink-faint">
        <span>Sumber: database classicmodels</span>
        <AppVersion />
        <span className="tnum">
          API {health.data ? `v${health.data.version}` : health.isError ? 'tidak terjangkau' : '…'}
        </span>
      </div>
    </aside>
  );
}
