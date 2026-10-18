// Gaya bersama grafik Recharts. Warna selalu lewat token di src/index.css
// (`var(--color-chart-*)`), bukan hex, supaya tema tetap satu sumber.

/** Seri grafik berurutan; makna tidak boleh hanya bergantung pada warna (selalu ada label/legenda). */
export const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
] as const;

export const CHART_GRID = 'var(--color-chart-grid)';

/** Props untuk `tick` pada XAxis/YAxis. */
export const AXIS_TICK = { fontSize: 12, fill: 'var(--color-ink-muted)' } as const;

/** Judul sumbu: `position` dan `angle` diisi per grafik. */
export const AXIS_TITLE_STYLE = { fontSize: 12, fill: 'var(--color-ink-muted)', textAnchor: 'middle' } as const;

export const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid var(--color-line)',
  boxShadow: 'none',
  color: 'var(--color-ink)',
} as const;
