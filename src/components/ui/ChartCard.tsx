import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { EmptyState } from '@/components/ui/EmptyState';

interface ChartCardProps {
  title: string;
  description?: string;
  /**
   * WAJIB. Ringkasan teks isi grafik (satu-dua kalimat, mis. "USA memimpin
   * dengan US$3.273.280,05 dari 5 negara teratas."). Dibaca pembaca layar
   * sebagai pengganti grafik; tidak tampil di layar.
   */
  summary: string;
  /**
   * Tabel/daftar ringkas data yang sama dengan grafik. Tampil di balik
   * "Lihat data sebagai tabel" untuk semua pengguna. Sangat disarankan.
   */
  table?: ReactNode;
  /** Tidak ada data untuk filter ini: tampilkan keadaan kosong, bukan grafik kosong. */
  empty?: boolean;
  emptyText?: string;
  /** Kelas tinggi/lebar area grafik. Default `h-64` agar ResponsiveContainer punya tinggi. */
  chartClassName?: string;
  /** Slot grafik (Recharts). Warna lewat token `var(--color-chart-*)`. */
  children: ReactNode;
  className?: string;
}

/**
 * Pembungkus grafik: judul, deskripsi, area grafik, dan alternatif teks.
 * Area grafik `role="img"` berlabel judul dan dijelaskan `summary`, sehingga
 * pembaca layar tidak menelusuri ratusan elemen SVG; datanya tetap tersedia
 * lewat `summary` dan `table`.
 */
export function ChartCard({
  title,
  description,
  summary,
  table,
  empty = false,
  emptyText = 'Tidak ada data untuk filter ini.',
  chartClassName = 'h-64',
  children,
  className,
}: ChartCardProps) {
  const id = useId();
  const titleId = `${id}-title`;
  const summaryId = `${id}-summary`;

  return (
    <section
      aria-labelledby={titleId}
      className={cn('flex min-w-0 flex-col gap-3 rounded-xl border border-line bg-surface px-4 py-3.5', className)}
    >
      <header className="flex flex-col gap-0.5">
        <h3 id={titleId} className="m-0 text-[14px] font-semibold text-ink">
          {title}
        </h3>
        {description && <p className="m-0 text-[12px] text-ink-muted">{description}</p>}
      </header>

      {empty ? (
        <EmptyState dashed>{emptyText}</EmptyState>
      ) : (
        <>
          <div role="img" aria-labelledby={titleId} aria-describedby={summaryId} className={cn('w-full min-w-0', chartClassName)}>
            {children}
          </div>
          <p id={summaryId} className="sr-only">
            {summary}
          </p>
          {table && (
            <details className="text-[12px] text-ink-soft">
              <summary className="w-fit cursor-pointer rounded-md py-0.5 text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                Lihat data sebagai tabel
              </summary>
              <div className="mt-2 overflow-x-auto">{table}</div>
            </details>
          )}
        </>
      )}
    </section>
  );
}
