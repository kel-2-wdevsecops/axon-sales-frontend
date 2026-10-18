# F02 — Analisis Produk (FE)

| | |
|---|---|
| Prioritas | P0 |
| Repo / branch | FE · `feature/analisis-produk` |
| Pasangan BE | `feat/f02-produk` di repo BE (endpoint `GET /api/v1/dashboard/products`) |
| Route FE | `/produk` |
| Padanan Power BI | Halaman **Products** |
| Bergantung pada | FE F06 dan FE F01 (komponen bersama) ter-merge; BE F02 ter-merge (atau BE lokal berjalan dengan endpoint-nya) |
| Status | 🟨 Sedang dikerjakan |

## Tujuan

Membantu tim marketing dan produk melihat product line, produk, dan vendor mana yang menghasilkan penjualan, kapan order ramai, dan produk laris mana yang stoknya menipis.

## User Stories

- Sebagai tim produk, saya ingin membandingkan penjualan dan profit per product line agar tahu lini mana yang perlu dikembangkan.
- Sebagai tim marketing, saya ingin melihat produk terlaris dan produk yang tidak terjual agar bisa mengatur promosi.
- Sebagai tim pengadaan, saya ingin melihat 5 vendor teratas dan stok produk laris agar hubungan vendor dan stok terjaga.
- Sebagai tim marketing, saya ingin melihat jumlah order per bulan agar tahu musim ramai.

## Tampilan

| Elemen | Visual | Catatan |
|---|---|---|
| Filter | Product line (pilihan ganda), tahun, bulan (F06) | Power BI punya slicer tahun/bulan di halaman ini; README BE baru menyebut product line. Tahun/bulan ditambahkan untuk paritas |
| KPI | Penjualan, Profit, Margin, Order, Kuantitas terjual | |
| Penjualan per product line | Bar horizontal (penjualan + profit) | Klik bar → toggle product line di filter |
| Order per tahun | Treemap atau kolom | Power BI memakai treemap |
| Order per bulan | Area, sumbu Jan–Des | Akumulasi semua tahun dalam filter, urutan kalender |
| Top 5 vendor by penjualan | Kolom | |
| Tabel produk | `DataTable`: nama, product line, penjualan, profit, kuantitas, order, stok | Urut default penjualan menurun; kolom bisa diurutkan; pencarian nama di FE; baris stok rendah diberi penanda |

## Kontrak API (salinan dari dokumen BE; BE adalah sumber kebenaran)

`GET /api/v1/dashboard/products?productLine=&productLine=&year=&month=`

```json
{
  "kpi": { "sales": 9604190.61, "profit": 3825880.25, "profitMarginPct": 39.84, "orders": 326, "quantity": 105516 },
  "salesByProductLine": [{ "productLine": "Classic Cars", "sales": 3853922.49, "profit": 1526212.20 }],
  "ordersByYear": [{ "year": 2003, "orders": 111 }],
  "ordersByMonth": [{ "month": 1, "orders": 25 }],
  "topVendors": [{ "vendor": "Classic Metal Creations", "sales": 934554.42 }],
  "products": [{
    "productCode": "S18_3232", "productName": "1992 Ferrari 360 Spider red", "productLine": "Classic Cars",
    "sales": 276839.98, "profit": 135996.78, "quantity": 1808, "orders": 53, "quantityInStock": 8347, "lowStock": false
  }]
}
```

## Aturan Bisnis yang memengaruhi tampilan

- Jumlah order per product line tidak dijumlahkan menjadi total (satu order bisa berisi beberapa product line); jangan menjumlahkannya di FE.
- `ordersByMonth` selalu berisi 12 baris (bulan tanpa order = 0); tampilkan urutan kalender Jan–Des.
- `products` memuat semua produk pada product line terpilih, termasuk yang tidak pernah terjual (penjualan 0). Tampilkan apa adanya.
- `lowStock` ditentukan BE (ambang default 100, asumsi yang perlu disepakati tim); FE hanya memberi penanda pada baris `lowStock: true`, bukan menghitung ulang.
- Nilai `productLine` yang dikirim berasal dari daftar F06 (urut alfabetis dan di-dedup).

## Langkah Pengerjaan

- [x] 1. Buat branch `feat/f02-produk` dari `main` terbaru (FE F06 dan F01 sudah ter-merge); ubah status F02 di `docs/PRD.md` §7 menjadi 🟨. _(Dikerjakan di `feature/analisis-produk`; PRD §7 sudah 🟨.)_
- [x] 2. Tipe `Products` di `src/types/index.ts`; `api.products(filter)` di `src/api/index.ts` (array `productLine` dikirim sebagai key berulang); key di `src/api/queryKeys.ts`. _(Ditambah tipe `ProductsFilter` dan `ProductRow`. Key berulang sudah dari `paramsSerializer` di `http.ts`; dibuktikan test `src/api/products.test.ts` dan `src/api/queryKeys.test.ts`.)_
- [x] 3. Hook `useProducts` di `src/hooks/` (`staleTime: Infinity`, `keepPreviousData`) dengan filter dari `usePageFilters` (parameter: `productLine`, `year`, `month`). _(Filter dari `useDashboardFilter('products')`; ada opsi `enabled` seperti `useOverview`.)_
- [x] 4. Halaman di `src/pages/products/` dibungkus `QueryState`; daftarkan route `/produk` di `src/app/App.tsx` dan menu di `src/app/navigation.ts`. _(Route dimuat lewat `React.lazy`. Menu "Produk" ditambah dan label "Beranda" diganti "Ringkasan".)_
- [x] 5. Pasang filter F06 (product line multi-select, tahun, bulan). _(`FilterBar page="products"`; product line berupa sekelompok kotak centang.)_
- [x] 6. Lima kartu KPI (pakai komponen bersama F01). _(`KpiCard`; penjualan dan profit ringkas di nilai utama, nilai penuh `id-ID` di keterangan dan `title`.)_
- [x] 7. Grafik Recharts (dengan judul, label sumbu, dan alternatif teks): penjualan per product line (bar horizontal, penjualan + profit; klik bar → toggle product line di filter), order per tahun (treemap atau kolom), order per bulan (area Jan–Des), top 5 vendor (kolom). _(Order per tahun memakai kolom. Alternatif teks: ringkasan untuk pembaca layar + `ChartTable`; tombol toggle product line di tabel sebagai jalur keyboard. Kode selesai dan lolos build; tampilan belum diperiksa di browser.)_
- [x] 8. Tabel produk dengan `DataTable`: kolom nama, product line, penjualan, profit, kuantitas, order, stok; urut default penjualan menurun; kolom bisa diurutkan; pencarian nama di FE (fungsi murni di `src/lib/` + test); penanda stok rendah (ikon/teks, tidak hanya warna) pada baris `lowStock`. _(Pencarian dan pengurutan di `src/lib/productSearch.ts` + test. `DataTable` mendapat `sort`/`onSort`/`cardsBelow` yang kompatibel mundur; di bawah `lg` baris menjadi kartu dan urutan dipilih lewat `<select>`. Tampilan belum diperiksa di browser.)_
- [ ] 9. Keadaan `EmptyState` untuk hasil nol; responsif; cek tidak ada pelanggaran CSP. _(`EmptyState` sudah dipasang di halaman, grafik, dan tabel; kode tidak memakai `<style>` runtime, sumber eksternal, atau `dangerouslySetInnerHTML`. Responsif belum diukur dan CSP belum dicek di browser pada build produksi.)_
- [ ] 10. Uji manual terhadap BE lokal berisi dump; centang kriteria F06 yang menunggu halaman ini (`/produk?productLine=Ships&productLine=Classic%20Cars&year=2004` dinormalisasi). _(Belum dikerjakan: butuh BE lokal dan browser.)_
- [x] 11. `npm run lint`, `npm test`, `npm run build` hijau.
- [ ] 12. Commit terakhir: status F02 di PRD §7 menjadi 🟩, isi kolom PR; buka PR ke `main`.

## Kriteria Penerimaan

Nilai yang tampil harus sama dengan respons API; angka acuan lengkap ada di dokumen F02 repo BE.

_Semua kriteria di bawah belum terbukti: butuh BE nyata berisi dump dan pemeriksaan di browser. Logika murni (pengurutan 12 bulan Jan–Des, pencarian nama, pengurutan kolom, serialisasi `productLine` berulang) sudah dicakup test._

- [ ] Tanpa filter, bar penjualan per product line berurutan: Classic Cars, Vintage Cars, Motorcycles, Trucks and Buses, Planes, Ships, Trains.
- [ ] Top 5 vendor tampil: Classic Metal Creations, Unimax Art Galleries, Gearbox Collectibles, Second Gear Diecast, Exoto Designs.
- [ ] Order per bulan menampilkan 12 bulan Jan–Des dengan November tertinggi (63).
- [ ] Tabel memuat 110 produk; produk teratas 1992 Ferrari 360 Spider red (penjualan 276.839,98, 53 order); 1985 Toyota Supra tampil dengan penjualan 0.
- [ ] 1968 Ford Mustang (stok 68) bertanda stok rendah.
- [ ] Memilih Classic Cars dan Vintage Cars membuat URL berisi dua `productLine` berurutan alfabetis dan KPI penjualan = 5.651.482,12.
- [ ] Klik bar product line men-toggle filter yang sama dengan dropdown.
- [ ] Kolom tabel bisa diurutkan dan nama produk bisa dicari.

## Definisi Selesai

Langkah dan kriteria tercentang, CI hijau, status di PRD §7 = 🟩.
