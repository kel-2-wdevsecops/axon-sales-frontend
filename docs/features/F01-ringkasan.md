# F01 — Ringkasan Penjualan (FE)

| | |
|---|---|
| Prioritas | P0 |
| Repo / branch | FE · `feat/f01-ringkasan` |
| Pasangan BE | `feat/f01-ringkasan` di repo BE (endpoint `GET /api/v1/dashboard/overview`) |
| Route FE | `/` (menggantikan halaman Beranda kerangka) |
| Padanan Power BI | Halaman **Home** |
| Bergantung pada | FE F06 ter-merge; BE F01 ter-merge (atau BE lokal berjalan dengan endpoint-nya) |
| Status | 🟨 Sedang dikerjakan |

## Tujuan

Memberi manajemen gambaran kinerja dalam satu layar: berapa omzet dan profit, berapa pelanggan, dari pasar mana penjualan datang, dan bagaimana trennya per tahun.

## User Stories

- Sebagai eksekutif, saya ingin melihat total penjualan, profit, dan margin agar tahu kesehatan bisnis saat ini.
- Sebagai manajer regional, saya ingin memfilter per benua dan negara agar bisa menilai pasar saya sendiri.
- Sebagai eksekutif, saya ingin melihat 5 negara dengan penjualan terbesar agar tahu pasar mana yang perlu dijaga.

## Tampilan

| Elemen | Visual | Catatan |
|---|---|---|
| Filter | Tahun, bulan, benua, negara (F06) | Pilihan negara menyempit sesuai benua terpilih |
| KPI | 6 kartu: Penjualan, Profit, Margin, Order, Customer (terdaftar / aktif), Karyawan | Angka besar diringkas (`9,6 jt`), nilai penuh di `title`/tooltip |
| Top 5 negara by penjualan | Bar horizontal | Klik bar → set filter negara |
| Customer per benua | Donut (5 irisan) | Klik irisan → set filter benua |
| Customer per negara | Bar horizontal top 10 + "Lainnya" | Power BI memakai pie 27 irisan; diganti karena pie dengan 27 irisan tidak terbaca |
| Penjualan dan profit per tahun | Kolom berkelompok | Tahun 2005 diberi label "Jan–Mei" |
| Sorotan | Panel F07 | P1, dikerjakan di FE F07 |

## Kontrak API (salinan dari dokumen BE; BE adalah sumber kebenaran)

`GET /api/v1/dashboard/overview?year=&month=&continent=&country=`

Semua parameter opsional. `month` tanpa `year` berarti bulan itu di semua tahun.

```json
{
  "kpi": {
    "sales": 9604190.61,
    "profit": 3825880.25,
    "profitMarginPct": 39.84,
    "orders": 326,
    "customers": 122,
    "activeCustomers": 98,
    "employees": 23
  },
  "topCountriesBySales": [{ "country": "USA", "sales": 3273280.05 }],
  "customersByContinent": [{ "continent": "Europe", "customers": 64 }],
  "customersByCountry": [{ "country": "USA", "continent": "North America", "customers": 36 }],
  "salesByYear": [{ "year": 2003, "sales": 3317348.39, "profit": 1320622.94, "isPartial": false }]
}
```

## Aturan Bisnis yang memengaruhi tampilan

- Filter waktu (`year`, `month`) memengaruhi penjualan, profit, margin, order, customer aktif, top negara, dan penjualan per tahun. Filter geografi memengaruhi semua metrik kecuali karyawan. Penghitungannya di BE; FE hanya mengirim filter.
- `customers`, `customersByContinent`, `customersByCountry` adalah customer terdaftar dan tidak terpengaruh filter waktu (sama dengan Power BI). Beri label UI: "Customer terdaftar".
- `employees` selalu jumlah seluruh karyawan (23).
- `customersByCountry` dikirim lengkap (maksimal 27 baris); pengelompokan "Lainnya" dilakukan FE di `src/lib/`.
- Tahun yang `isPartial` (2005) diberi label "Jan–Mei".

## Langkah Pengerjaan

- [x] 1. Buat branch `feat/f01-ringkasan` dari `main` terbaru (FE F06 sudah ter-merge); ubah status F01 di `docs/PRD.md` §7 menjadi 🟨. _(Dikerjakan di `feature/ringkasan-penjualan`, bertumpuk di atas `feature/filter-tautan`; PRD §7 sudah 🟨.)_
- [x] 2. Tipe `Overview` di `src/types/index.ts`; `api.overview(filter)` di `src/api/index.ts`; key react-query di `src/api/queryKeys.ts`. _(Sudah ada dari branch fondasi; dipakai ulang.)_
- [x] 3. Hook `useOverview` di `src/hooks/` (`staleTime: Infinity`, `placeholderData: keepPreviousData`) yang menerima filter dari `usePageFilters` (F06). _(Filter dari `useDashboardFilter('overview')`; ada opsi `enabled` agar permintaan menunggu pilihan filter termuat.)_
- [x] 4. Fungsi murni + test di `src/lib/`: pemformat angka ringkas (`9,6 jt`) dan format uang `id-ID` (`US$9.604.190,61`), pengelompokan "top 10 negara + Lainnya" dari `customersByCountry`, label periode parsial ("Jan–Mei"). _(`format.ts` + `overviewChart.ts` beserta test-nya. Label parsial memakai penulisan `period.ts`: `2005 (Jan-Mei)`, dengan tanda hubung biasa.)_
- [x] 5. Komponen bersama yang akan dipakai ulang F02–F05 (asumsi penempatan, PRD §13): kartu KPI (angka ringkas, nilai penuh di `title`/tooltip), pembungkus kartu grafik dengan judul, label sumbu, dan alternatif teks (ringkasan atau tabel). _(`KpiCard` dan `ChartCard` dari fondasi; ditambah `ChartTable` dan `components/charts/chartTheme.ts`.)_
- [x] 6. Halaman di `src/pages/home/` (atau pindahkan ke `src/pages/overview/`; catat pilihan di PR) membungkus data dengan `QueryState`; pasang filter F06 (tahun, bulan, benua, negara). _(Tetap di `src/pages/home/`.)_
- [ ] 7. Enam kartu KPI; grafik Recharts: top 5 negara (bar horizontal), customer per benua (donut 5 irisan), customer per negara (bar horizontal top 10 + Lainnya), penjualan dan profit per tahun (kolom berkelompok; 2005 berlabel "Jan–Mei"). Label "Customer terdaftar" dipakai untuk metrik yang tidak terpengaruh filter waktu. _(Kode selesai dan lolos build; tampilan belum diperiksa di browser.)_
- [ ] 8. Interaksi silang: klik bar negara → `?country=...`; klik irisan benua → `?continent=...` lewat `setFilter` F06. _(Kode selesai, termasuk tombol di tabel alternatif sebagai jalur keyboard; belum dicoba di browser.)_
- [x] 9. Sediakan slot untuk panel Sorotan F07 (belum diisi di branch ini). _(Penanda posisi di `OverviewContent.tsx`, antara KPI dan grafik.)_
- [ ] 10. Keadaan `EmptyState` bila data kosong; responsif: ≤ 640 px kartu KPI 2 kolom dan grafik tidak meluap horizontal. _(`EmptyState` sudah ada; responsif belum diukur di browser.)_
- [x] 11. Daftarkan route dan menu bila berubah (`src/app/App.tsx`, `src/app/navigation.ts`). _(Route `/` dimuat lewat `React.lazy` + `Suspense`; menu tidak berubah.)_
- [ ] 12. Uji manual terhadap BE lokal berisi dump; cek konsol browser pada build produksi untuk pelanggaran CSP.
- [x] 13. `npm run lint`, `npm test`, `npm run build` hijau.
- [ ] 14. Commit terakhir: status F01 di PRD §7 menjadi 🟩, isi kolom PR; buka PR ke `main`.

## Kriteria Penerimaan

Nilai yang tampil harus sama dengan respons API; angka acuan lengkap ada di dokumen F01 repo BE.

- [ ] Tanpa filter, kartu menampilkan penjualan 9.604.190,61; profit 3.825.880,25; margin 39,84 %; 326 order; 122 customer (98 aktif); 23 karyawan (dalam format `id-ID`, diringkas dengan nilai penuh di tooltip).
- [ ] Donut customer per benua menampilkan Europe 64, North America 39, Asia 9, Oceania 9, Africa 1.
- [ ] Top 5 negara tampil berurutan: USA, Spain, France, Australia, New Zealand.
- [ ] Kolom penjualan per tahun menampilkan 2003, 2004, 2005; 2005 berlabel "Jan–Mei".
- [ ] Norway tampil sebagai satu negara dengan 3 customer.
- [ ] Klik bar negara mengubah URL menjadi `?country=...` dan semua visual ikut berubah.
- [ ] Pada mobile (≤ 640 px) kartu KPI tersusun 2 kolom dan grafik tidak meluap horizontal.
- [ ] Setiap grafik punya judul, label sumbu, dan alternatif teks.

## Definisi Selesai

Langkah dan kriteria tercentang, CI hijau, status di PRD §7 = 🟩. Komponen bersama siap dipakai FE F02–F05 dan slot Sorotan siap diisi FE F07.
