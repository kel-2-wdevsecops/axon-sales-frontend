import { cn } from '@/lib/cn';
import { EMPTY_VALUE } from '@/lib/format';
import { formatSignedPercent, growthDirection, type GrowthDirection } from '@/lib/growth';

interface GrowthValueProps {
  /** Persen dari BE; null = tidak ada pembanding. Tidak dihitung ulang di sini. */
  pct: number | null | undefined;
  className?: string;
}

const TONE: Record<GrowthDirection, string> = {
  up: 'text-gain',
  down: 'text-loss',
  flat: 'text-ink-soft',
  none: 'text-ink-muted',
};

/** Teks untuk pembaca layar; tanda +/- sudah ada di teks tampil, tetapi arahnya disebut eksplisit. */
const SPOKEN: Record<GrowthDirection, string> = {
  up: 'Naik',
  down: 'Turun',
  flat: 'Tidak berubah',
  none: 'Tidak ada pembanding',
};

const ICON_PATH: Record<Exclude<GrowthDirection, 'none'>, string> = {
  up: 'M12 19V5M5 12l7-7 7 7',
  down: 'M12 5v14M19 12l-7 7-7-7',
  flat: 'M5 12h14',
};

/**
 * Nilai pertumbuhan: ikon panah naik/turun DAN warna DAN tanda +/- (arah tidak
 * pernah hanya lewat warna). `null` tampil `--`, tidak pernah NaN/Infinity.
 */
export function GrowthValue({ pct, className }: GrowthValueProps) {
  const direction = growthDirection(pct);

  return (
    <span className={cn('tnum inline-flex items-center gap-1 font-medium whitespace-nowrap', TONE[direction], className)}>
      {direction === 'none' ? (
        <>
          <span aria-hidden="true">{EMPTY_VALUE}</span>
          <span className="sr-only">{SPOKEN.none}</span>
        </>
      ) : (
        <>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-[0.85em] shrink-0"
          >
            <path d={ICON_PATH[direction]} />
          </svg>
          <span className="sr-only">{SPOKEN[direction]} </span>
          {formatSignedPercent(pct)}
        </>
      )}
    </span>
  );
}
