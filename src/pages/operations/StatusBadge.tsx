import { cn } from '@/lib/cn';
import { statusTone, type StatusTone } from '@/lib/operations';

interface StatusBadgeProps {
  /** Nilai status dari BE (mis. "On Hold"); ditampilkan apa adanya sebagai teks. */
  status: string;
  className?: string;
}

const TONE_CLASSES: Record<StatusTone, string> = {
  attention: 'bg-note-soft text-note-ink',
  positive: 'bg-line-soft text-gain',
  negative: 'bg-line-soft text-loss',
  neutral: 'bg-line-soft text-ink-soft',
};

/** Ikon per status, supaya status terbedakan juga tanpa warna. Status tak dikenal memakai titik. */
function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'On Hold': // jeda
      return <path d="M9 5v14M15 5v14" />;
    case 'Disputed': // peringatan
      return (
        <>
          <path d="M12 3.5 2.5 20h19z" />
          <path d="M12 10v5M12 18v.01" />
        </>
      );
    case 'In Process': // jam
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      );
    case 'Shipped': // centang
      return <path d="m5 12.5 4.5 4.5L19 7.5" />;
    case 'Resolved': // centang dalam lingkaran
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12.5 3 3 5-6" />
        </>
      );
    case 'Cancelled': // silang
      return <path d="M6 6l12 12M18 6 6 18" />;
    default:
      return <circle cx="12" cy="12" r="3" />;
  }
}

/**
 * Penanda status order: ikon + teks status + warna (arti tidak pernah hanya
 * lewat warna). Teks status dirender sebagai teks biasa.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap',
        TONE_CLASSES[statusTone(status)],
        className,
      )}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0"
      >
        <StatusIcon status={status} />
      </svg>
      {status}
    </span>
  );
}
