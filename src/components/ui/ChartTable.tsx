import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface ChartTableRow {
  key: string;
  /** Sel pertama = judul baris (`<th scope="row">`); sisanya angka (rata kanan). */
  cells: ReactNode[];
}

interface ChartTableProps {
  /** Dibaca pembaca layar; tidak tampil. */
  caption: string;
  headers: string[];
  rows: ChartTableRow[];
  className?: string;
}

/**
 * Tabel data yang sama dengan grafik, untuk `ChartCard.table`. Kolom pertama
 * berisi label, kolom lain angka (sudah diformat oleh pemanggil).
 */
export function ChartTable({ caption, headers, rows, className }: ChartTableProps) {
  return (
    <table className={cn('tnum w-full border-collapse text-left text-[12px]', className)}>
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {headers.map((header, i) => (
            <th key={header} scope="col" className={cn('py-1.5 font-medium text-ink-muted', i > 0 && 'pl-3 text-right')}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-t border-line-soft">
            {row.cells.map((cell, i) =>
              i === 0 ? (
                <th key={i} scope="row" className="py-1.5 pr-3 font-normal text-ink">
                  {cell}
                </th>
              ) : (
                <td key={i} className="py-1.5 pl-3 text-right text-ink-soft">
                  {cell}
                </td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
