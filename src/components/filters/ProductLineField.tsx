import { cn } from '@/lib/cn';
import { toggleValue } from '@/lib/filterState';
import { CheckIcon } from './FilterIcons';

interface ProductLineFieldProps {
  /** Semua product line dari /dashboard/filters. */
  choices: string[];
  selected: readonly string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

/**
 * Pilihan ganda product line: sekelompok kotak centang bergaya tombol. Tab
 * pindah antar pilihan, Spasi mencentang. Pilihan terpilih ditandai warna
 * dan ikon centang (bukan warna saja).
 */
export function ProductLineField({ choices, selected, onChange, disabled = false }: ProductLineFieldProps) {
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0" disabled={disabled}>
      <legend className="mb-1 p-0 text-[12px] font-medium text-ink-muted">Product line</legend>
      <div className="flex flex-wrap gap-1.5">
        {choices.map((name) => {
          const checked = selected.includes(name);
          return (
            <label
              key={name}
              className={cn(
                'inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[13px] select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent has-disabled:cursor-not-allowed has-disabled:opacity-60',
                checked
                  ? 'border-accent bg-accent text-white'
                  : 'border-line bg-surface text-ink-soft hover:bg-line-soft',
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={() => onChange(toggleValue(selected, name))}
              />
              {checked && <CheckIcon />}
              {name}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
