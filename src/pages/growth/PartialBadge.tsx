interface PartialBadgeProps {
  /** Mis. "data sampai 31 Mei 2005" (dari `partialTooltip(dataRange.to)`). */
  tooltip: string;
}

/**
 * Label "parsial" untuk periode yang belum lengkap. Tooltip lewat tiga jalur:
 * `title` (hover), popup CSS saat fokus keyboard (`tabIndex=0`), dan teks
 * `sr-only` untuk pembaca layar. Popup tampil di atas lencana agar tidak
 * terpotong tepi bawah tabel.
 */
export function PartialBadge({ tooltip }: PartialBadgeProps) {
  return (
    <span className="group relative inline-flex">
      <span
        tabIndex={0}
        title={tooltip}
        className="inline-flex cursor-help items-center rounded-md bg-note-soft px-1.5 py-0.5 text-[11px] font-medium text-note-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        parsial
        <span className="sr-only">, {tooltip}</span>
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 hidden rounded-md border border-line bg-surface px-2 py-1 text-[11px] font-normal whitespace-nowrap text-ink group-focus-within:block"
      >
        {tooltip}
      </span>
    </span>
  );
}
