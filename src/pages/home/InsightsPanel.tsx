import { useId, useState } from 'react';
import { QueryState } from '@/components/feedback/QueryState';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInsights } from '@/hooks/useInsights';
import { limitInsights } from '@/lib/insights';
import { InsightCard } from './InsightCard';

/**
 * Panel "Sorotan" di Ringkasan (F07): poin penting dan rekomendasi dari BE,
 * maksimal 6 kartu dulu lalu "Lihat semua". Memuat datanya sendiri dan tidak
 * bergantung pada filter, sehingga gagal/kosong/lambatnya tidak mengganggu
 * KPI dan grafik di sekitarnya. FE tidak membuat atau menghitung insight.
 */
export function InsightsPanel() {
  const insights = useInsights();
  const [expanded, setExpanded] = useState(false);
  const headingId = useId();
  const listId = useId();
  const isLoading = insights.data === undefined && !insights.error;
  const { visible, hiddenCount } = limitInsights(insights.data ?? [], expanded);

  return (
    <section aria-labelledby={headingId} className="flex min-w-0 flex-col gap-3">
      <header className="flex flex-col gap-0.5">
        <h2 id={headingId} className="m-0 text-[16px] font-semibold text-ink">
          Sorotan
        </h2>
        <p className="m-0 text-[12px] text-ink-muted">Poin penting dan rekomendasi dari seluruh data; tidak terpengaruh filter.</p>
      </header>

      <QueryState isLoading={isLoading} error={insights.error}>
        {insights.data && insights.data.length === 0 ? (
          <EmptyState dashed>Belum ada insight</EmptyState>
        ) : (
          <>
            <ul id={listId} className="m-0 grid list-none gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </ul>
            {hiddenCount > 0 && (
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={listId}
                onClick={() => setExpanded((open) => !open)}
                className="inline-flex min-h-9 w-fit cursor-pointer items-center rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-ink hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {expanded ? 'Tampilkan lebih sedikit' : `Lihat semua (${visible.length + hiddenCount})`}
              </button>
            )}
          </>
        )}
      </QueryState>
    </section>
  );
}
