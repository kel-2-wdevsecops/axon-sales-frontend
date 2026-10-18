import type { FilterChange, FilterChip } from '@/lib/filterState';
import { CloseIcon } from './FilterIcons';

interface ActiveFilterChipsProps {
  chips: FilterChip[];
  onRemove: (change: FilterChange) => void;
}

/** Baris filter aktif: satu tombol per filter, klik untuk menghapusnya. */
export function ActiveFilterChips({ chips, onRemove }: ActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <ul aria-label="Filter aktif" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {chips.map((chip) => (
        <li key={chip.id}>
          <button
            type="button"
            aria-label={chip.ariaLabel}
            onClick={() => onRemove(chip.change)}
            className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md bg-line-soft px-2 text-[12px] text-ink-soft hover:bg-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {chip.label}
            <CloseIcon width={12} height={12} />
          </button>
        </li>
      ))}
    </ul>
  );
}
