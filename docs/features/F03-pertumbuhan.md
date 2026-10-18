# F03 — Analisis Pertumbuhan (FE)

| | |
|---|---|
| Prioritas | P0 |
| Repo / branch | FE · `feature/analisis-pertumbuhan` |
| Pasangan BE | `feat/f03-pertumbuhan` di repo BE (endpoint `GET /api/v1/dashboard/growth`) |
| Route FE | `/pertumbuhan` |
| Padanan Power BI | Halaman **Sales** |
| Bergantung pada | FE F06 dan FE F01 (komponen bersama) ter-merge; BE F03 ter-merge (atau BE lokal berjalan dengan endpoint-nya) |
| Status | 🟨 Sedang dikerjakan |

## Tujuan

Membantu manajemen menilai apakah penjualan tumbuh dengan membandingkan setiap periode dengan periode kalender sebelumnya: tahun ke tahun (YoY), kuartal ke kuartal (QoQ), dan bulan ke bulan (MoM).

## User Stories

- Sebagai eksekutif, saya ingin melihat pertumbuhan penjualan tahunan agar tahu apakah strategi tahun ini lebih berhasil.
- Sebagai manajer sales, saya ingin melihat perubahan per kuartal dan per bulan agar bisa mendeteksi penurunan lebih awal.
- Sebagai eksekutif, saya ingin perbandingan yang adil untuk tahun berjalan (2005 baru sampai Mei) agar tidak salah menyimpulkan penjualan anjlok.

## Tampilan

| Elemen | Visual | Catatan |
|---|---|---|
| Filter | Tahun (F06) | Sama dengan Power BI |
| Kartu YTD | Penjualan Jan–Mei 2005 vs Jan–Mei 2004 | Tambahan; menjawab bias tahun parsial |
| Tabel YoY | Tahun, penjualan, tahun sebelumnya, growth % | |
| Tabel QoQ | Tahun, kuartal, penjualan, kuartal sebelumnya, growth % | Power BI tidak menampilkan penjualan kuartal berjalan di tabel ini; di sini ditampilkan |
| Tabel MoM | Tahun, bulan, penjualan, bulan sebelumnya, growth % | |
| Penjualan dan profit per tahun | Kolom berkelompok | |

Growth positif diberi warna dan ikon naik, negatif warna dan ikon turun (tidak hanya warna, agar terbaca oleh pengguna buta warna). Nilai `null` tampil "—". Baris parsial diberi label "parsial" dan tooltip "data sampai 31 Mei 2005".

## Kontrak API (salinan dari dokumen BE; BE adalah sumber kebenaran)

`GET /api/v1/dashboard/growth?year=`

```json
{
  "dataRange": { "from": "2003-01-06", "to": "2005-05-31" },
  "ytd": { "year": 2005, "throughMonth": 5, "sales": 1770936.71, "previous": 1235480.38, "growthPct": 43.34 },
  "yearly": [{ "year": 2004, "sales": 4515905.51, "previous": 3317348.39, "growthPct": 36.13, "isPartial": false }],
  "quarterly": [{ "year": 2004, "quarter": 1, "sales": 799579.31, "previous": 1779084.61, "growthPct": -55.06, "isPartial": false }],
  "monthly": [{ "year": 2004, "month": 1, "sales": 292385.21, "previous": 276723.25, "growthPct": 5.66, "isPartial": false }],
  "salesProfitByYear": [{ "year": 2004, "sales": 4515905.51, "profit": 1809381.14 }]
}
```

## Aturan Bisnis yang memengaruhi tampilan

- Growth, periode sebelumnya, dan status parsial dihitung di BE; FE tidak menghitung ulang.
- `growthPct` bernilai `null` bila tidak ada pembanding atau pembanding 0: tampilkan "—", tidak pernah "Infinity" atau "NaN".
- `isPartial` → label "parsial" dengan tooltip "data sampai 31 Mei 2005" (tanggal dari `dataRange.to`).
- Filter `year` hanya memilih baris yang ditampilkan (dengan `year=2004`, Januari 2004 tetap punya pembanding dari Desember 2003 di respons).
- Kartu YTD tidak terpengaruh filter.

## Langkah Pengerjaan

- [x] 1. Buat branch `feat/f03-pertumbuhan` dari `main` terbaru (FE F06 dan F01 sudah ter-merge); ubah status F03 di `docs/PRD.md` §7 menjadi 🟨. _(Dikerjakan di `feature/analisis-pertumbuhan`, dari main yang memuat fondasi, F06, dan F01; PRD §7 sudah 🟨.)_
- [x] 2. Tipe `Growth` di `src/types/index.ts`; `api.growth(filter)` di `src/api/index.ts`; key di `src/api/queryKeys.ts`. _(Ditambah `GrowthFilter`, `GrowthPoint`, `YearToDate`. Bentuk mengikuti kode BE `lib/growth.ts`: `previous` bertipe `number | null`, bukan `number` seperti contoh JSON di atas.)_
- [x] 3. Hook `useGrowth` di `src/hooks/` (`staleTime: Infinity`, `keepPreviousData`) dengan filter dari `usePageFilters` (parameter: `year`). _(Filter dari `useDashboardFilter('growth')`; opsi `enabled` seperti `useOverview`.)_
- [x] 4. Fungsi murni + test di `src/lib/`: format persen bertanda (`+36,13 %`), `null` → "—", label periode, tooltip parsial dari `dataRange.to`. _(`growth.ts` + `growth.test.ts`; `formatIsoDate` ditambah di `period.ts`. Persen negatif memakai tanda minus U+2212; `null` tampil `--` mengikuti `EMPTY_VALUE` di `format.ts`.)_
- [x] 5. Halaman di `src/pages/growth/` dibungkus `QueryState`; daftarkan route `/pertumbuhan` di `src/app/App.tsx` dan menu di `src/app/navigation.ts`. _(Route lazy; menu "Pertumbuhan" dengan ikon baru `TrendingUpIcon`.)_
- [x] 6. Pasang filter F06 (tahun). _(`FilterBar page="growth"`: hanya tahun.)_
- [x] 7. Kartu YTD (Jan–Mei 2005 vs Jan–Mei 2004) memakai komponen bersama F01. _(`KpiCard` untuk dua penjualan; kartu pertumbuhan YTD memakai gaya yang sama karena `KpiCard` hanya menerima teks. Bagian disembunyikan bila `ytd` null.)_
- [x] 8. Tabel YoY, QoQ (dengan penjualan kuartal berjalan), dan MoM memakai `DataTable`; sel growth dengan ikon naik/turun **dan** warna; `null` tampil "—"; baris parsial berlabel "parsial" dengan tooltip. _(`GrowthTableCard`, `GrowthValue`, `PartialBadge`; tooltip lewat `title`, popup saat fokus keyboard, dan teks untuk pembaca layar.)_
- [x] 9. Kolom berkelompok penjualan dan profit per tahun dengan judul, label sumbu, dan alternatif teks. _(`SalesProfitByYearChart` lewat `ChartCard` + `ChartTable`.)_
- [x] 10. Keadaan `EmptyState`; responsif (tabel tidak meluap horizontal di mobile); cek CSP. _(`DataTable` menjadi kartu per baris di layar sempit; tanpa `<style>` runtime, sumber eksternal, atau `dangerouslySetInnerHTML`. Tampilan di browser belum dilihat: belum terbukti.)_
- [ ] 11. Uji manual terhadap BE lokal berisi dump; centang kriteria F06 yang menunggu halaman ini (`/?year=2004&country=USA` → `/pertumbuhan?year=2004`). _(Belum dikerjakan: butuh BE lokal dan browser.)_
- [x] 12. `npm run lint`, `npm test`, `npm run build` hijau. _(Lihat laporan pengerjaan.)_
- [ ] 13. Commit terakhir: status F03 di PRD §7 menjadi 🟩, isi kolom PR; buka PR ke `main`.

## Kriteria Penerimaan

Nilai yang tampil harus sama dengan respons API; angka acuan lengkap ada di dokumen F03 repo BE.

_Catatan: belum terbukti. Kriteria di bawah butuh BE lokal berisi dump dan browser; di branch ini baru lolos lint, test unit (format, label, tooltip, arah growth), dan build._

- [ ] Tabel YoY menampilkan 2003 "—", 2004 +36,13 %, 2005 −60,78 % dengan label "parsial".
- [ ] Tabel QoQ menampilkan Q4 2003 +188,39 % dan Q1 2004 −55,06 %.
- [ ] Tabel MoM menampilkan Januari 2003 "—", Desember 2003 −71,99 %, Januari 2004 +5,66 %.
- [ ] Kartu YTD menampilkan 1.770.936,71 vs 1.235.480,38 = +43,34 %.
- [ ] `year=2004` menampilkan 1 baris YoY, 4 baris QoQ, 12 baris MoM; Januari 2004 tetap punya pembanding.
- [ ] Tidak ada tulisan "Infinity" atau "NaN" di UI.
- [ ] Growth positif/negatif dibedakan oleh ikon dan warna sekaligus.
- [ ] Baris parsial berlabel "parsial" dengan tooltip "data sampai 31 Mei 2005".
- [ ] Navigasi dari Ringkasan `?year=2004&country=USA` ke Pertumbuhan menghasilkan `/pertumbuhan?year=2004`.

## Definisi Selesai

Langkah dan kriteria tercentang, CI hijau, status di PRD §7 = 🟩.
