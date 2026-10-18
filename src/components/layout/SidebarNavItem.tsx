import type { ComponentType, SVGProps } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

interface SidebarNavItemProps {
  to: string;
  /** Query string tujuan (mis. `?year=2004`) agar filter ikut pindah halaman. */
  search?: string;
  label: string;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  count?: number;
  onClick?: () => void;
}

export function SidebarNavItem({ to, search, label, icon: Icon, count, onClick }: SidebarNavItemProps) {
  return (
    <NavLink
      to={{ pathname: to, search }}
      // "/" hanya aktif di Beranda sendiri, bukan di semua halaman.
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-[14px] transition-colors',
          isActive
            ? 'bg-accent-soft font-medium text-accent'
            : 'font-normal text-ink-soft hover:bg-line-soft',
        )
      }
    >
      <span className="flex min-w-0 items-center gap-3">
        {Icon && <Icon className="shrink-0" />}
        <span className="truncate">{label}</span>
      </span>
      {count != null && <span className="tnum shrink-0 text-[12px] text-ink-faint">{count}</span>}
    </NavLink>
  );
}
