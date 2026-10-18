import { useId } from 'react';
import { cn } from '@/lib/cn';

interface KpiCardProps {
  label: string;
  /** Sudah diformat (src/lib/format.ts); kartu tidak menghitung atau memformat angka. */
  value: string;
  /** Nilai penuh bila `value` diringkas; tampil sebagai tooltip (`title`). */
  fullValue?: string;
  /** Keterangan di bawah nilai, mis. "Customer terdaftar, tidak terpengaruh filter waktu". */
  note?: string;
  /** Penanda periode parsial, mis. "Jan–Mei". Kosong = periode lengkap. */
  partialLabel?: string;
  className?: string;
}

/** Kartu satu angka KPI. Semua teks dirender sebagai teks, bukan HTML. */
export function KpiCard({ label, value, fullValue, note, partialLabel, className }: KpiCardProps) {
  const labelId = useId();

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className={cn('flex min-w-0 flex-col gap-1 rounded-xl border border-line bg-surface px-4 py-3.5', className)}
    >
      <p id={labelId} className="m-0 text-[12px] font-medium text-ink-muted">
        {label}
      </p>
      <p
        title={fullValue}
        className="tnum m-0 text-[18px] leading-tight font-semibold tracking-tight break-words text-ink sm:text-[22px]"
      >
        {value}
      </p>
      {note && <p className="m-0 text-[12px] text-ink-muted">{note}</p>}
      {partialLabel && (
        <p className="m-0">
          <span className="inline-flex items-center rounded-md bg-note-soft px-1.5 py-0.5 text-[11px] font-medium text-note-ink">
            <span className="sr-only">Periode parsial: </span>
            {partialLabel}
          </span>
        </p>
      )}
    </div>
  );
}
