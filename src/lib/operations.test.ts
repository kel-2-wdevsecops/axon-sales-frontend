import { describe, expect, it } from 'vitest';
import type { Operations } from '@/types';
import {
  describeAsOf,
  formatDays,
  formatOrderDate,
  isOperationsEmpty,
  LEAD_TIME_BUCKETS,
  ORDER_NOTE_MAX,
  statusTone,
  summarizeLeadTime,
  summarizeOrdersByStatus,
  summarizeSalesByStatus,
  toLeadTimeColumns,
  toOrderNote,
} from './operations';

// Angka acuan: docs/features/F05-operasional-order.md (contoh respons dan kriteria
// penerimaan). Penjualan per status selain On Hold hanya contoh bentuk data.
const LEAD_TIME: Operations['shippingLeadTime'] = [
  { bucket: '0-2', orders: 99 },
  { bucket: '3-5', orders: 163 },
  { bucket: '6-10', orders: 49 },
  { bucket: '>10', orders: 1 },
];

const STATUS_ROWS: Operations['statusBreakdown'] = [
  { status: 'Shipped', orders: 303, sales: 9000000 },
  { status: 'On Hold', orders: 4, sales: 169575.61 },
];

const emptyOperations = (over: Partial<Operations> = {}): Operations => ({
  asOf: null,
  kpi: { orders: 0, shipped: 0, needsAttention: 0, overdue: 0, lateShipments: 0, avgShipDays: null },
  statusBreakdown: [],
  attentionOrders: [],
  shippingLeadTime: LEAD_TIME_BUCKETS.map((bucket) => ({ bucket, orders: 0 })),
  slowestShipments: [],
  ...over,
});

// Surrogate yatim = setengah pasangan UTF-16 yang terbelah.
const LONE_SURROGATE = /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/;

describe('toOrderNote', () => {
  it('batasnya 160 karakter', () => {
    expect(ORDER_NOTE_MAX).toBe(160);
  });

  it('null, undefined, kosong, dan hanya spasi -> null', () => {
    expect(toOrderNote(null)).toBeNull();
    expect(toOrderNote(undefined)).toBeNull();
    expect(toOrderNote('')).toBeNull();
    expect(toOrderNote(' \n\t ')).toBeNull();
  });

  it('catatan pendek tampil utuh dan tidak ditandai terpotong', () => {
    expect(toOrderNote('Menunggu pembayaran.')).toEqual({
      text: 'Menunggu pembayaran.',
      full: 'Menunggu pembayaran.',
      truncated: false,
    });
  });

  it('tepat 160 karakter tidak dipotong; 161 dipotong ke 160 + elipsis', () => {
    expect(toOrderNote('a'.repeat(160))?.truncated).toBe(false);
    const note = toOrderNote('a'.repeat(161));
    expect(note?.truncated).toBe(true);
    expect(note?.text).toBe(`${'a'.repeat(160)}\u2026`);
    expect(note?.full).toBe('a'.repeat(161));
  });

  it('contoh catatan credit limit dari dokumen (kurang dari 160 karakter) tampil utuh; versi yang lebih panjang dipotong dan teks lengkapnya tersedia', () => {
    const credit =
      'The outstaniding balance for this customer exceeds their credit limit. Order will be shipped when a payment is received.';
    expect(toOrderNote(credit)).toEqual({ text: credit, full: credit, truncated: false });

    const longer = `${credit} Please contact the customer and the sales representative to confirm the payment schedule before release.`;
    const note = toOrderNote(longer);
    expect(longer.length).toBeGreaterThan(ORDER_NOTE_MAX);
    expect(note?.truncated).toBe(true);
    expect([...(note?.text ?? '')]).toHaveLength(ORDER_NOTE_MAX + 1);
    expect(note?.text.endsWith('\u2026')).toBe(true);
    expect(note?.full).toBe(longer);
  });

  it('memotong per code point: emoji di batas tidak terbelah menjadi surrogate yatim', () => {
    const text = `${'a'.repeat(159)}\u{1F600}bcd`; // emoji = code point ke-160
    const note = toOrderNote(text);
    expect(note?.truncated).toBe(true);
    expect(note?.text).toBe(`${'a'.repeat(159)}\u{1F600}\u2026`);
    expect(LONE_SURROGATE.test(note?.text ?? '')).toBe(false);
  });

  it('160 emoji (320 unit UTF-16) bukan terpotong; 161 dipotong ke 160 emoji', () => {
    expect(toOrderNote('\u{1F600}'.repeat(160))?.truncated).toBe(false);
    const note = toOrderNote('\u{1F600}'.repeat(161));
    expect(note?.truncated).toBe(true);
    expect(note?.text).toBe(`${'\u{1F600}'.repeat(160)}\u2026`);
    expect(LONE_SURROGATE.test(note?.text ?? '')).toBe(false);
  });

  it('spasi dan baris baru beruntun dirapatkan; spasi sebelum elipsis dibuang', () => {
    expect(toOrderNote('Baris satu.\r\n\r\nBaris   dua.')?.text).toBe('Baris satu. Baris dua.');
    const note = toOrderNote(`${'a'.repeat(159)} ${'b'.repeat(10)}`);
    expect(note?.text).toBe(`${'a'.repeat(159)}\u2026`);
  });

  it('isi HTML dibiarkan apa adanya sebagai teks (tidak dibuang, tidak di-escape) - React yang meloloskannya', () => {
    const script = '<script>alert("x")</script><img src=x onerror=alert(1)>';
    const note = toOrderNote(script);
    expect(note?.text).toBe(script);
    expect(note?.full).toBe(script);
  });

  it('batas kustom dan batas tidak valid', () => {
    expect(toOrderNote('abcdef', 3)?.text).toBe('abc\u2026');
    expect(toOrderNote('abcdef', 0)?.text).toBe('a\u2026');
    expect(toOrderNote('a'.repeat(200), Number.NaN)?.text).toBe(`${'a'.repeat(160)}\u2026`);
  });
});

describe('statusTone', () => {
  it('status perlu perhatian, selesai, dibatalkan, dan tak dikenal', () => {
    expect(statusTone('On Hold')).toBe('attention');
    expect(statusTone('Disputed')).toBe('attention');
    expect(statusTone('In Process')).toBe('attention');
    expect(statusTone('Shipped')).toBe('positive');
    expect(statusTone('Resolved')).toBe('positive');
    expect(statusTone('Cancelled')).toBe('negative');
    expect(statusTone('Lainnya')).toBe('neutral');
  });
});

describe('formatOrderDate dan describeAsOf', () => {
  it('tanggal ISO -> format Indonesia', () => {
    expect(formatOrderDate('2004-11-19')).toBe('19 November 2004');
  });

  it('kosong atau tidak valid -> tanda pengganti', () => {
    expect(formatOrderDate(null)).toBe('--');
    expect(formatOrderDate(undefined)).toBe('--');
    expect(formatOrderDate('kemarin')).toBe('--');
    expect(formatOrderDate('2004-13-40')).toBe('--');
  });

  it('keterangan per tanggal data terakhir (bukan hari ini); tanpa tanggal valid -> null', () => {
    expect(describeAsOf('2005-05-31')).toBe('per 31 Mei 2005');
    expect(describeAsOf(null)).toBeNull();
    expect(describeAsOf('bukan tanggal')).toBeNull();
  });
});

describe('formatDays', () => {
  it('bulat tanpa desimal, pecahan dua desimal (koma Indonesia)', () => {
    expect(formatDays(65)).toBe('65 hari');
    expect(formatDays(0)).toBe('0 hari');
    expect(formatDays(3.76)).toBe('3,76 hari');
  });

  it('null, NaN, dan Infinity -> tanda pengganti', () => {
    expect(formatDays(null)).toBe('--');
    expect(formatDays(undefined)).toBe('--');
    expect(formatDays(Number.NaN)).toBe('--');
    expect(formatDays(Number.POSITIVE_INFINITY)).toBe('--');
  });
});

describe('toLeadTimeColumns', () => {
  it('empat wadah berurutan dengan label hari; angka dari BE tidak berubah', () => {
    const columns = toLeadTimeColumns(LEAD_TIME);
    expect(columns.map((c) => c.bucket)).toEqual(['0-2', '3-5', '6-10', '>10']);
    expect(columns.map((c) => c.orders)).toEqual([99, 163, 49, 1]);
    expect(columns.map((c) => c.label)).toEqual(['0-2 hari', '3-5 hari', '6-10 hari', 'Lebih dari 10 hari']);
  });

  it('urutan masuk diabaikan; wadah yang hilang menjadi 0; wadah tak dikenal diabaikan', () => {
    const rows = [
      { bucket: '>10', orders: 1 },
      { bucket: '0-2', orders: 99 },
      { bucket: '99', orders: 7 },
    ] as Operations['shippingLeadTime'];
    expect(toLeadTimeColumns(rows).map((c) => c.orders)).toEqual([99, 0, 0, 1]);
  });

  it('tanpa data tetap empat wadah bernilai 0', () => {
    expect(toLeadTimeColumns([])).toHaveLength(4);
    expect(toLeadTimeColumns([]).every((c) => c.orders === 0)).toBe(true);
  });
});

describe('isOperationsEmpty', () => {
  it('semua kosong -> true', () => {
    expect(isOperationsEmpty(emptyOperations())).toBe(true);
  });

  it('ada order di KPI, rincian status, daftar, wadah, atau pengiriman terlama -> false', () => {
    expect(isOperationsEmpty(emptyOperations({ kpi: { ...emptyOperations().kpi, orders: 1 } }))).toBe(false);
    expect(isOperationsEmpty(emptyOperations({ statusBreakdown: STATUS_ROWS }))).toBe(false);
    expect(isOperationsEmpty(emptyOperations({ shippingLeadTime: LEAD_TIME }))).toBe(false);
    expect(isOperationsEmpty(emptyOperations({ slowestShipments: [{ orderNumber: 10165, customerName: 'X', days: 65 }] }))).toBe(false);
  });
});

describe('ringkasan teks grafik', () => {
  it('jumlah order per status mengikuti urutan BE', () => {
    expect(summarizeOrdersByStatus(STATUS_ROWS)).toBe(
      'Jumlah order per status, dari penjualan terbesar: Shipped 303, On Hold 4.',
    );
    expect(summarizeOrdersByStatus([])).toBe('Tidak ada order untuk filter ini.');
  });

  it('penjualan per status memakai format US$ Indonesia', () => {
    expect(summarizeSalesByStatus(STATUS_ROWS)).toBe(
      'Penjualan per status, dari terbesar: Shipped US$9.000.000,00, On Hold US$169.575,61.',
    );
    expect(summarizeSalesByStatus([])).toBe('Tidak ada penjualan untuk filter ini.');
  });

  it('lama pengiriman menyebut setiap wadah; tanpa pengiriman -> kalimat kosong', () => {
    expect(summarizeLeadTime(toLeadTimeColumns(LEAD_TIME))).toBe(
      'Jumlah order terkirim menurut lama pengiriman: 0-2 hari 99 order, 3-5 hari 163 order, 6-10 hari 49 order, Lebih dari 10 hari 1 order.',
    );
    expect(summarizeLeadTime(toLeadTimeColumns([]))).toBe('Belum ada order terkirim untuk filter ini.');
  });
});
