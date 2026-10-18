import { describe, expect, it } from 'vitest';
import type { Insight } from '@/types';
import { INSIGHT_LINKS, INSIGHT_VISIBLE_LIMIT, limitInsights, safeInsightLink, severityMeta } from './insights';

const make = (n: number): Insight[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `rule-${i + 1}`,
    severity: 'info',
    title: `Judul ${i + 1}`,
    detail: `Detail ${i + 1}`,
    recommendation: `Rekomendasi ${i + 1}`,
    metric: { value: i + 1, unit: 'count' },
    link: '/produk',
  }));

describe('severityMeta', () => {
  it('tiap severity punya label teks Indonesia dan ikon sendiri', () => {
    expect(severityMeta('warning')).toEqual({ label: 'Perlu tindakan', icon: 'alert' });
    expect(severityMeta('positive')).toEqual({ label: 'Positif', icon: 'trend-up' });
    expect(severityMeta('info')).toEqual({ label: 'Info', icon: 'info' });
  });

  it('severity tak dikenal (termasuk nama properti Object) jatuh ke info', () => {
    expect(severityMeta('critical')).toEqual(severityMeta('info'));
    expect(severityMeta('')).toEqual(severityMeta('info'));
    expect(severityMeta('toString')).toEqual(severityMeta('info'));
    expect(severityMeta('__proto__')).toEqual(severityMeta('info'));
  });
});

describe('safeInsightLink', () => {
  it('semua route internal yang mungkin dari BE lolos apa adanya', () => {
    expect(INSIGHT_LINKS).toEqual(['/', '/produk', '/pertumbuhan', '/pelanggan', '/operasional']);
    for (const link of INSIGHT_LINKS) expect(safeInsightLink(link)).toBe(link);
  });

  it.each([
    ['URL eksternal', 'https://example.com/produk'],
    ['URL tanpa skema (protocol-relative)', '//example.com'],
    ['javascript:', 'javascript:alert(1)'],
    ['javascript: berhuruf besar/spasi', ' JavaScript:alert(1)'],
    ['data:', 'data:text/html,<script>alert(1)</script>'],
    ['route yang tidak dikenal', '/admin'],
    ['route dengan query', '/produk?year=2004'],
    ['route dengan hash', '/produk#top'],
    ['route dengan garis miring penutup', '/produk/'],
    ['route dengan spasi', '/produk '],
    ['route berhuruf besar', '/Produk'],
    ['path relatif', 'produk'],
    ['path traversal', '/produk/../admin'],
    ['string kosong', ''],
  ])('%s tidak dijadikan tautan', (_name, link) => {
    expect(safeInsightLink(link)).toBeNull();
  });

  it('nilai bukan string tidak dijadikan tautan', () => {
    expect(safeInsightLink(undefined)).toBeNull();
    expect(safeInsightLink(null)).toBeNull();
    expect(safeInsightLink(42)).toBeNull();
    expect(safeInsightLink({ toString: () => '/produk' })).toBeNull();
    expect(safeInsightLink(['/produk'])).toBeNull();
  });
});

describe('limitInsights', () => {
  it('batas bawaan adalah 6 kartu', () => {
    expect(INSIGHT_VISIBLE_LIMIT).toBe(6);
  });

  it('9 insight: 6 terlihat dulu, 3 tersembunyi, urutan BE dipertahankan', () => {
    const all = make(9);
    const { visible, hiddenCount } = limitInsights(all, false);
    expect(visible.map((i) => i.id)).toEqual(['rule-1', 'rule-2', 'rule-3', 'rule-4', 'rule-5', 'rule-6']);
    expect(hiddenCount).toBe(3);
  });

  it('"Lihat semua" menampilkan seluruh 9 insight sesuai urutan masukan', () => {
    const all = make(9);
    const { visible } = limitInsights(all, true);
    expect(visible).toEqual(all);
    expect(visible).not.toBe(all);
  });

  it('6 insight atau kurang: semuanya terlihat dan tidak ada yang tersembunyi', () => {
    expect(limitInsights(make(6), false)).toMatchObject({ hiddenCount: 0 });
    expect(limitInsights(make(6), false).visible).toHaveLength(6);
    expect(limitInsights(make(2), false).visible).toHaveLength(2);
  });

  it('array kosong tetap kosong', () => {
    expect(limitInsights([], false)).toEqual({ visible: [], hiddenCount: 0 });
    expect(limitInsights([], true)).toEqual({ visible: [], hiddenCount: 0 });
  });

  it('tidak mengubah array masukan', () => {
    const all = make(9);
    const snapshot = structuredClone(all);
    limitInsights(all, false);
    limitInsights(all, true);
    expect(all).toEqual(snapshot);
  });

  it('batas kustom dipakai; batas tidak valid kembali ke bawaan', () => {
    expect(limitInsights(make(9), false, 2).visible).toHaveLength(2);
    expect(limitInsights(make(9), false, 2).hiddenCount).toBe(7);
    expect(limitInsights(make(9), false, -1).visible).toHaveLength(6);
    expect(limitInsights(make(9), false, Number.NaN).visible).toHaveLength(6);
  });
});
