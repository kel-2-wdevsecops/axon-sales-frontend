# F04 — Pelanggan dan Tim Sales (FE)

| | |
|---|---|
| Prioritas | P1 |
| Repo / branch | FE · `feature/pelanggan-tim-sales` |
| Pasangan BE | `feat/f04-pelanggan-tim-sales` di repo BE (endpoint `GET /api/v1/dashboard/customers`) |
| Route FE | `/pelanggan` |
| Padanan | Insight PPTX (slide 9, 11, 14) dan query `Axon SQL.sql` no. 2, 10, 18, 22, 26. Tidak ada di Power BI |
| Bergantung pada | FE F06 dan FE F01 (komponen bersama) ter-merge; BE F04 ter-merge (atau BE lokal berjalan dengan endpoint-nya) |
| Status | 🟨 Sedang dikerjakan |

## Tujuan

Membantu manajer sales mengenali pelanggan bernilai tinggi, prospek yang belum pernah membeli, dan kinerja sales rep serta kantor, agar hubungan pelanggan utama dijaga dan beban kerja tim seimbang.

## User Stories

- Sebagai manajer sales, saya ingin melihat 10 pelanggan dengan penjualan terbesar agar bisa memprioritaskan hubungan dengan mereka.
- Sebagai manajer sales, saya ingin tahu berapa pelanggan terdaftar yang belum pernah order agar tim bisa menindaklanjuti prospek.
- Sebagai manajer sales, saya ingin membandingkan jumlah pelanggan dan penjualan per sales rep dan per kantor agar bisa memberi apresiasi dan menyeimbangkan beban.
- Sebagai tim keuangan, saya ingin melihat sebaran segmen credit limit pelanggan.

## Tampilan

| Elemen | Visual | Catatan |
|---|---|---|
| Filter | Tahun, benua, negara (F06) | |
| KPI | Customer terdaftar, Customer aktif, Prospek (belum order), Tanpa sales rep, Rata-rata nilai order | |
| Top 10 customer | `DataTable`: nama perusahaan, negara, penjualan, order, porsi % | Tanpa nama kontak, telepon, alamat |
| Kinerja sales rep | Bar (penjualan) + tabel: nama, kantor, customer, order, penjualan | Termasuk rep tanpa customer (nilai 0) |
| Penjualan per kantor | Bar: kota kantor, territory, penjualan, customer | |
| Segmen credit limit | Donut 4 segmen | Agregat saja |

## Kontrak API (salinan dari dokumen BE; BE adalah sumber kebenaran)

`GET /api/v1/dashboard/customers?year=&continent=&country=`

```json
{
  "kpi": {
    "customers": 122, "activeCustomers": 98, "prospects": 24,
    "withoutSalesRep": 22, "avgOrderValue": 29460.71
  },
  "topCustomers": [{ "customerNumber": 141, "customerName": "Euro+ Shopping Channel", "country": "Spain", "sales": 820689.54, "orders": 26, "sharePct": 8.55 }],
  "salesReps": [{ "employeeNumber": 1370, "name": "Gerard Hernandez", "office": "Paris", "customers": 7, "orders": 43, "sales": 1258577.81 }],
  "offices": [{ "officeCode": "4", "city": "Paris", "country": "France", "territory": "EMEA", "customers": 29, "sales": 3083761.58 }],
  "creditSegments": [
    { "segment": "none", "label": "Tanpa limit (0)", "customers": 24 },
    { "segment": "low", "label": "< 10.000", "customers": 0 },
    { "segment": "medium", "label": "10.000–75.000", "customers": 36 },
    { "segment": "high", "label": "> 75.000", "customers": 62 }
  ]
}
```

## Aturan Bisnis yang memengaruhi tampilan

- Filter waktu memengaruhi penjualan, order, customer aktif, dan rata-rata nilai order; tidak memengaruhi customer terdaftar, prospek, dan segmen credit limit. Beri label yang jelas agar pengguna tidak bingung saat angka tertentu tidak berubah saat tahun diganti.
- Atribusi penjualan ke sales rep dan kantor memakai penugasan saat ini (asumsi; dump tidak menyimpan riwayat). Cantumkan keterangan singkat di UI.
- `salesReps` termasuk rep tanpa customer (nilai 0): tampilkan, jangan disembunyikan.
- Segmen credit limit ditampilkan sebagai agregat 4 segmen; label segmen datang dari BE (`label`).
- Data yang tidak ada di kontrak (nama kontak, telepon, alamat, email, credit limit per customer) tidak boleh ditampilkan atau diminta.
- Nama sales rep tampil sesuai keputusan Q3 (default: boleh); bila Q3 ditolak, ikuti perubahan kontrak BE.

## Langkah Pengerjaan

- [x] 1. Branch dibuat dari `main` terbaru (nama aktual `feature/pelanggan-tim-sales`, bukan `feat/f04-...`); status F04 di `docs/PRD.md` §7 menjadi 🟨.
- [x] 2. Tipe `Customers` di `src/types/index.ts` (hanya field pada kontrak); `api.customers(filter)` di `src/api/index.ts`; key di `src/api/queryKeys.ts`.
- [x] 3. Hook `useCustomers` di `src/hooks/` (`staleTime: Infinity`, `keepPreviousData`) dengan filter dari `useDashboardFilter('customers')` (parameter: `year`, `continent`, `country`).
- [x] 4. Halaman di `src/pages/customers/` dibungkus `QueryState`; daftarkan route `/pelanggan` di `src/app/App.tsx` dan menu di `src/app/navigation.ts`.
- [x] 5. Pasang filter F06 (tahun, benua, negara).
- [x] 6. Lima kartu KPI (komponen bersama F01), dengan label "Customer terdaftar" dan "Prospek (belum order)".
- [x] 7. Tabel Top 10 customer (`DataTable`: nama perusahaan, negara, penjualan, order, porsi %); tanpa kolom data pribadi.
- [x] 8. Bar penjualan per sales rep + tabel (nama, kantor, customer, order, penjualan), termasuk rep bernilai 0.
- [x] 9. Bar penjualan per kantor (kota, territory, penjualan, customer) dan donut segmen credit limit (4 segmen) dengan alternatif teks.
- [x] 10. Keterangan atribusi "penugasan saat ini"; `EmptyState`; responsif; cek CSP. *(Belum terbukti di browser: responsif dan CSP baru diperiksa dari kode, tanpa render nyata.)*
- [ ] 11. Uji manual terhadap BE lokal berisi dump. *(Belum dilakukan.)*
- [x] 12. `npm run lint`, `npm test`, `npm run build` hijau.
- [ ] 13. Commit terakhir: status F04 di PRD §7 menjadi 🟩, isi kolom PR; buka PR ke `main`.

## Kriteria Penerimaan

Nilai yang tampil harus sama dengan respons API; angka acuan lengkap ada di dokumen F04 repo BE.

> Belum terbukti: semua kriteria di bawah butuh BE nyata berisi dump (langkah 11); FE baru diuji dengan lint, tes unit, dan build.

- [ ] Tanpa filter, KPI menampilkan 122 customer, 98 aktif, 24 prospek, 22 tanpa sales rep, rata-rata nilai order 29.460,71.
- [ ] Top 2 customer tampil: Euro+ Shopping Channel 820.689,54 (26 order) dan Mini Gifts Distributors Ltd. 591.827,34 (17 order).
- [ ] Jumlah customer per rep tertinggi: Pamela Castillo 10, Barry Jones 9.
- [ ] Penjualan rep tertinggi: Gerard Hernandez 1.258.577,81.
- [ ] Kantor: Paris 3.083.761,58 tertinggi, Tokyo 457.110,07 terendah; 7 kantor tampil.
- [ ] Donut segmen credit limit menampilkan 24 / 0 / 36 / 62.
- [ ] Tom King dan Yoshimi Kato tampil dengan 0 customer.
- [ ] Tidak ada nama kontak, telepon, alamat, email, atau credit limit per customer di UI maupun di tipe FE.
- [ ] Mengganti tahun mengubah penjualan/order/aktif, tetapi tidak mengubah customer terdaftar, prospek, dan segmen credit limit.

## Definisi Selesai

Langkah dan kriteria tercentang, CI hijau, status di PRD §7 = 🟩.
