interface FilterButtonProps {
  /** Nilai yang dipakai sebagai filter, juga teks tombol (mis. nama negara). */
  label: string;
  onSelect: () => void;
}

/**
 * Tombol teks di dalam tabel alternatif grafik: jalur keyboard/pembaca layar
 * untuk interaksi "klik batang/irisan -> saring ke nilai itu".
 */
export function FilterButton({ label, onSelect }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      title={`Saring ke ${label}`}
      className="cursor-pointer rounded-sm text-left text-ink underline decoration-line underline-offset-2 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {label}
    </button>
  );
}
