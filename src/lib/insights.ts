import type { Insight, InsightSeverity } from '@/types';

// Penyajian respons GET /dashboard/insights (F07). Fungsi murni: aturan,
// ambang, dan teks insight dihitung BE; di sini hanya label severity, validasi
// tautan, dan pembatas jumlah kartu. FE tidak membuat atau mengurutkan insight
// (urutan BE: warning, positive, info, dipertahankan).

/** Nama ikon severity; gambarnya ada di komponen (src/components/insights). */
export type InsightIconName = 'alert' | 'trend-up' | 'info';

export interface SeverityMeta {
  /** Teks label yang tampil di kartu; severity tidak pernah hanya lewat warna. */
  label: string;
  icon: InsightIconName;
}

const SEVERITY_META: Record<InsightSeverity, SeverityMeta> = {
  warning: { label: 'Perlu tindakan', icon: 'alert' },
  positive: { label: 'Positif', icon: 'trend-up' },
  info: { label: 'Info', icon: 'info' },
};

/** Label dan ikon severity. Nilai yang tidak dikenal (BE lebih baru dari FE) diperlakukan sebagai `info`. */
export function severityMeta(severity: string): SeverityMeta {
  return Object.hasOwn(SEVERITY_META, severity) ? SEVERITY_META[severity as InsightSeverity] : SEVERITY_META.info;
}

/**
 * Daftar putih route internal yang boleh dituju kartu insight: semua nilai
 * `link` yang mungkin dari BE (INSIGHT_LINKS di backend/src/lib/insights.ts).
 * `/pelanggan` dan `/operasional` baru punya halaman setelah F04/F05 ter-merge.
 */
export const INSIGHT_LINKS = ['/', '/produk', '/pertumbuhan', '/pelanggan', '/operasional'] as const;

export type InsightLink = (typeof INSIGHT_LINKS)[number];

/**
 * `link` yang aman dipakai sebagai tujuan `<Link>`, atau `null`. Hanya
 * kecocokan persis dengan daftar putih yang lolos: URL eksternal, `//host`,
 * `javascript:`, path tak dikenal, query/hash, dan nilai bukan string ditolak.
 */
export function safeInsightLink(link: unknown): InsightLink | null {
  return typeof link === 'string' ? (INSIGHT_LINKS.find((allowed) => allowed === link) ?? null) : null;
}

/** Jumlah kartu yang terlihat sebelum "Lihat semua". */
export const INSIGHT_VISIBLE_LIMIT = 6;

export interface LimitedInsights {
  visible: Insight[];
  /** Jumlah insight di luar batas; > 0 berarti tombol "Lihat semua" perlu tampil. */
  hiddenCount: number;
}

/** Batasi kartu yang terlihat tanpa mengubah urutan; `expanded` menampilkan semuanya. */
export function limitInsights(
  insights: readonly Insight[],
  expanded: boolean,
  limit: number = INSIGHT_VISIBLE_LIMIT,
): LimitedInsights {
  const max = Number.isInteger(limit) && limit >= 0 ? limit : INSIGHT_VISIBLE_LIMIT;
  const hiddenCount = Math.max(0, insights.length - max);
  return { visible: expanded ? [...insights] : insights.slice(0, max), hiddenCount };
}
