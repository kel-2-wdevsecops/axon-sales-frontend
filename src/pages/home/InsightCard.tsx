import { useId } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { safeInsightLink, severityMeta, type InsightIconName } from '@/lib/insights';
import type { Insight } from '@/types';

const ICON_PATHS: Record<InsightIconName, string[]> = {
  alert: ['M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z', 'M12 9v4', 'M12 17h.01'],
  'trend-up': ['M3 17 9 11l4 4 8-8', 'M15 7h6v6'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 16v-4', 'M12 8h.01'],
};

/** Warna lencana severity. Selalu dipasangkan dengan ikon dan teks label, tidak pernah warna saja. */
const TONE: Record<InsightIconName, string> = {
  alert: 'bg-note-soft text-note-ink',
  'trend-up': 'bg-line-soft text-gain',
  info: 'bg-line-soft text-ink-soft',
};

function SeverityIcon({ name }: { name: InsightIconName }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-3 shrink-0"
    >
      {ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const CARD = 'flex h-full min-w-0 flex-col gap-2 rounded-xl border border-line bg-surface px-4 py-3.5 text-ink';

interface InsightCardProps {
  insight: Insight;
}

/**
 * Satu sorotan. Seluruh kartu adalah `Link` React Router ke route internal
 * (fokus dan Enter bekerja seperti tautan biasa). `link` yang tidak ada di
 * daftar putih tidak dijadikan tautan: kartu tetap tampil sebagai teks.
 * Semua teks dari BE dirender sebagai teks biasa.
 */
export function InsightCard({ insight }: InsightCardProps) {
  const id = useId();
  const badgeId = `${id}-badge`;
  const titleId = `${id}-title`;
  const detailId = `${id}-detail`;
  const recommendationId = `${id}-recommendation`;
  const meta = severityMeta(insight.severity);
  const to = safeInsightLink(insight.link);

  const content = (
    <>
      <span id={badgeId} className={cn('inline-flex w-fit items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium', TONE[meta.icon])}>
        <SeverityIcon name={meta.icon} />
        {meta.label}
      </span>
      <h3 id={titleId} className="m-0 text-[14px] leading-snug font-semibold break-words text-ink">
        {insight.title}
      </h3>
      <p id={detailId} className="m-0 text-[13px] break-words text-ink-soft">
        {insight.detail}
      </p>
      <p id={recommendationId} className="m-0 text-[13px] break-words text-ink-soft">
        <span className="font-medium text-ink">Rekomendasi: </span>
        {insight.recommendation}
      </p>
      {to && (
        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-[12px] font-medium text-ink-muted group-hover:text-ink">
          Lihat detail
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-3 shrink-0">
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </span>
      )}
    </>
  );

  return (
    <li className="min-w-0">
      {to ? (
        <Link
          to={to}
          aria-labelledby={`${badgeId} ${titleId}`}
          aria-describedby={`${detailId} ${recommendationId}`}
          className={cn(
            CARD,
            'group transition-colors hover:border-ink-faint hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
          )}
        >
          {content}
        </Link>
      ) : (
        <div role="group" aria-labelledby={`${badgeId} ${titleId}`} className={CARD}>
          {content}
        </div>
      )}
    </li>
  );
}
