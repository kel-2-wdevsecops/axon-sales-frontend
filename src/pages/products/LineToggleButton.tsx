import { CheckIcon } from '@/components/filters/FilterIcons';

interface LineToggleButtonProps {
  /** Nama product line: teks tombol sekaligus nilai filter. */
  label: string;
  /** Product line ini sedang ada di filter. */
  pressed: boolean;
  onToggle: () => void;
}

/**
 * Tombol teks di tabel alternatif grafik: jalur keyboard/pembaca layar untuk
 * "klik batang = tambah/hapus product line dari filter". Status terpilih
 * ditandai ikon centang dan `aria-pressed`, bukan warna saja.
 */
export function LineToggleButton({ label, pressed, onToggle }: LineToggleButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onToggle}
      title={pressed ? `Hapus ${label} dari filter` : `Saring ke ${label}`}
      className="inline-flex cursor-pointer items-center gap-1 rounded-sm text-left text-ink underline decoration-line underline-offset-2 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {pressed && <CheckIcon width={12} height={12} />}
      {label}
    </button>
  );
}
