import { useId } from 'react';

export interface SelectChoice {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  /** Teks pilihan "tanpa filter", mis. "Semua tahun". Nilainya string kosong. */
  allLabel: string;
  /** String kosong = tanpa filter. */
  value: string;
  choices: SelectChoice[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Pilihan tunggal berupa `<select>` bawaan browser: panah, Enter, Escape, dan
 * pencarian huruf berjalan tanpa kode tambahan, termasuk di layar sentuh.
 */
export function FilterSelect({ label, allLabel, value, choices, onChange, disabled = false }: FilterSelectProps) {
  const id = useId();

  return (
    <div className="flex min-w-[9.5rem] flex-1 flex-col gap-1 sm:flex-none">
      <label htmlFor={id} className="text-[12px] font-medium text-ink-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full cursor-pointer rounded-lg border border-line bg-surface px-2.5 text-[13px] text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:bg-line-soft disabled:text-ink-muted"
      >
        <option value="">{allLabel}</option>
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </div>
  );
}
