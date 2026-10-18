# F07 — Sorotan Insight dan Rekomendasi (FE)

| | |
|---|---|
| Prioritas | P1 |
| Repo / branch | FE · `feature/sorotan-insight` |
| Pasangan BE | `feat/f07-sorotan-insight` di repo BE (endpoint `GET /api/v1/dashboard/insights`) |
| Tampil di | Panel "Sorotan" pada `/` (halaman F01) |
| Padanan | Slide Suggestions, Insight's, dan Recommendation di PPTX |
| Bergantung pada | FE F01 ter-merge (slot panel); BE F07 ter-merge (atau BE lokal berjalan dengan endpoint-nya) |
| Status | 🟨 Sedang dikerjakan |

## Tujuan

Mengubah angka menjadi kalimat yang bisa langsung ditindaklanjuti. Ini menjawab langsung tujuan proyek: dashboard tidak hanya menampilkan data, tetapi menunjukkan apa yang perlu diputuskan.

## User Stories

- Sebagai eksekutif dengan waktu terbatas, saya ingin membaca 5–9 poin penting tanpa harus menafsirkan grafik.
- Sebagai manajer, saya ingin setiap poin disertai rekomendasi dan tautan ke halaman detailnya.

## Pembagian Tugas dengan BE

Aturan insight (9 aturan, ambang, dan template teks) seluruhnya dihitung di BE; teks dikirim jadi dalam bahasa Indonesia dengan format angka `id-ID`. FE hanya merender. Daftar aturan ada di dokumen F07 repo BE. FE tidak membuat, menghitung, atau menerjemahkan insight.

## Kontrak API (salinan dari dokumen BE; BE adalah sumber kebenaran)

`GET /api/v1/dashboard/insights` (tanpa filter; dihitung atas seluruh data)

```json
[
  {
    "id": "top-product-line",
    "severity": "info",
    "title": "Classic Cars adalah lini terbesar",
    "detail": "Classic Cars menyumbang 40,13 % penjualan (3.853.922,49 dari 9.604.190,61).",
    "recommendation": "Perluas lini Classic Cars dan Vintage Cars; evaluasi lini dengan penjualan rendah.",
    "metric": { "value": 40.13, "unit": "percent" },
    "link": "/produk"
  }
]
```

- `severity`: `positive` (tren baik), `info` (fakta struktural), `warning` (perlu tindakan). Urutan respons: `warning`, lalu `positive`, lalu `info`. FE mempertahankan urutan dari BE.
- `link` hanya route internal yang dikenal, tidak pernah URL eksternal; FE memakainya sebagai tautan route internal (bukan `<a href>` eksternal).

## Tampilan

- Panel kartu di Ringkasan, maksimal 6 kartu terlihat dan tombol "Lihat semua".
- Ikon dan teks label untuk severity (tidak hanya warna).
- Setiap kartu bisa diklik menuju halaman pada `link`.
- Array kosong → "Belum ada insight" (`EmptyState`), bukan error.

## Langkah Pengerjaan

- [x] 1. Buat branch `feature/sorotan-insight` dari `main` terbaru (FE F01 sudah ter-merge); ubah status F07 di `docs/PRD.md` §7 menjadi 🟨.
- [x] 2. Tipe `Insight` (`id`, `severity`, `title`, `detail`, `recommendation`, `metric`, `link`) di `src/types/index.ts`; `api.insights()` di `src/api/index.ts`; key di `src/api/queryKeys.ts` (+ tes di `queryKeys.test.ts`).
- [x] 3. Hook `useInsights` di `src/hooks/` (`staleTime: Infinity`); tanpa filter, sehingga tidak ikut berubah saat filter halaman berganti.
- [x] 4. Komponen panel Sorotan (`src/pages/home/InsightsPanel.tsx`) yang mengisi slot di `OverviewContent` (halaman F01), dibungkus `QueryState` dan `PanelErrorBoundary`.
- [x] 5. Kartu insight (`src/pages/home/InsightCard.tsx`): ikon + teks label severity (Perlu tindakan / Positif / Info), judul, detail, rekomendasi; seluruh kartu adalah `Link` React Router ke route internal `link` (dapat difokus dan dioperasikan dengan keyboard). `link` divalidasi terhadap daftar putih (`src/lib/insights.ts`); di luar daftar, kartu tampil tanpa tautan.
- [x] 6. Maksimal 6 kartu terlihat dan tombol "Lihat semua" untuk menampilkan sisanya (fungsi murni `limitInsights` + tes di `src/lib/insights.test.ts`).
- [x] 7. Keadaan kosong "Belum ada insight"; keadaan error ditangani `QueryState` tanpa merusak halaman Ringkasan.
- [ ] 8. Responsif; cek CSP. Kode: grid 1/2/3 kolom (`md`/`xl`), teks `break-words`, tanpa `style=`, `<style>` runtime, sumber eksternal, atau `dangerouslySetInnerHTML`. Belum terbukti: tampilan belum dilihat di browser (tanpa overflow horizontal) dan CSP nginx belum diuji pada build yang disajikan.
- [ ] 9. Uji manual terhadap BE lokal berisi dump dan terhadap DB kosong. Belum dilakukan.
- [x] 10. `npm run lint`, `npm test` (218 tes), `npm run build` hijau di lokal. CI belum diperiksa.
- [ ] 11. Commit terakhir: status F07 di PRD §7 menjadi 🟩, isi kolom PR; buka PR ke `main`.

> Catatan: tautan kartu ke `/pelanggan` dan `/operasional` baru berfungsi setelah F04/F05 ter-merge. Sebelum itu rute tersebut jatuh ke `Navigate` ke `/` (rute `*` di `App.tsx`); daftar putih sudah memuatnya. Kartu `top-market` (`link: "/"`) mengarah ke halaman Ringkasan yang sedang dibuka.

## Kriteria Penerimaan

- [ ] Dengan data dump, panel menampilkan 6 kartu terlebih dulu dan "Lihat semua" menampilkan seluruh 9 insight, dengan teks dan angka persis seperti dari API.
- [ ] Pada DB kosong (array kosong), panel menampilkan "Belum ada insight" tanpa error.
- [ ] Setiap kartu memiliki ikon dan teks label severity, tidak hanya warna.
- [ ] Klik kartu (atau Enter saat fokus) membuka halaman pada `link` di aplikasi yang sama.
- [ ] Kegagalan endpoint insights tidak menghilangkan KPI dan grafik Ringkasan.

## Definisi Selesai

Langkah dan kriteria tercentang, CI hijau, status di PRD §7 = 🟩.
