# F05 — Operasional Order (FE)

| | |
|---|---|
| Prioritas | P1 (bagian Indikasi Piutang: P2) |
| Repo / branch | FE · `feature/operasional-order`; bagian piutang: `feat/f05-piutang` |
| Pasangan BE | `feat/f05-operasional-order` dan `feat/f05-piutang` di repo BE (endpoint `GET /api/v1/dashboard/operations`) |
| Route FE | `/operasional` |
| Padanan | Insight PPTX (slide 16, 17) dan query `Axon SQL.sql` no. 15, 17, 25. Tidak ada di Power BI |
| Bergantung pada | FE F06 dan FE F01 (komponen bersama) ter-merge; BE F05 ter-merge (piutang: BE `feat/f05-piutang` ter-merge) |
| Status | 🟨 Sedang dikerjakan (piutang: ⬜ ditunda, menunggu keputusan Q4; branch `feat/f05-piutang`) |

## Tujuan

Membuat order bermasalah terlihat sebelum pelanggan mengeluh: order yang tertahan, disengketakan, masih diproses, terlambat dikirim, serta nilai penjualan yang terkunci di order tersebut.

## User Stories

- Sebagai tim operasional, saya ingin melihat daftar order On Hold, Disputed, dan In Process beserta alasannya agar bisa segera ditindaklanjuti.
- Sebagai manajer, saya ingin tahu berapa lama rata-rata order dikirim dan order mana yang melewati tenggat agar proses fulfillment bisa diperbaiki.
- Sebagai manajer, saya ingin melihat nilai penjualan per status order, termasuk yang dibatalkan, agar tahu berapa omzet yang berisiko.
- (P2) Sebagai tim keuangan, saya ingin melihat indikasi tagihan yang belum dibayar agar tahu mengapa order tertahan karena credit limit.

## Tampilan

| Elemen | Visual | Catatan |
|---|---|---|
| Filter | Tahun, status (F06) | |
| KPI | Order, Terkirim, Perlu perhatian (On Hold + Disputed + In Process), Lewat tenggat, Rata-rata hari kirim | |
| Status order | Bar: jumlah order dan penjualan per status | |
| Order perlu perhatian | `DataTable`: no. order, tanggal order, tenggat, status, customer, nilai, catatan | Catatan dirender sebagai teks biasa (bukan HTML) dan dipotong 160 karakter |
| Lama pengiriman | Histogram 4 bucket: 0–2, 3–5, 6–10, > 10 hari | |
| Pengiriman terlama | Daftar 5 order dengan selisih hari terbesar | |
| Indikasi piutang (P2) | 3 angka agregat + jumlah customer yang melewati credit limit | Disertai catatan keterbatasan |

## Kontrak API (salinan dari dokumen BE; BE adalah sumber kebenaran)

`GET /api/v1/dashboard/operations?year=&status=`

```json
{
  "asOf": "2005-05-31",
  "kpi": { "orders": 326, "shipped": 303, "needsAttention": 13, "overdue": 4, "lateShipments": 1, "avgShipDays": 3.76 },
  "statusBreakdown": [{ "status": "On Hold", "orders": 4, "sales": 169575.61 }],
  "attentionOrders": [{
    "orderNumber": 10334, "orderDate": "2004-11-19", "requiredDate": "2004-11-28", "status": "On Hold",
    "customerName": "Volvo Model Replicas, Co", "sales": 23014.17,
    "comments": "The outstaniding balance for this customer exceeds their credit limit. Order will be shipped when a payment is received."
  }],
  "shippingLeadTime": [{ "bucket": "0-2", "orders": 99 }, { "bucket": "3-5", "orders": 163 }, { "bucket": "6-10", "orders": 49 }, { "bucket": ">10", "orders": 1 }],
  "slowestShipments": [{ "orderNumber": 10165, "customerName": "Dragon Souveniers, Ltd.", "days": 65 }],
  "receivables": { "billed": 9365336.43, "paid": 8853839.23, "outstanding": 511497.20, "customersOverCreditLimit": 3 }
}
```

`receivables` hanya ada bila P2 dikerjakan.

## Aturan Bisnis yang memengaruhi tampilan

- `asOf` adalah tanggal order terakhir di data (31 Mei 2005), bukan tanggal hari ini. Tampilkan "per {asOf}" di dekat KPI "Lewat tenggat" agar pengguna tidak mengira ini tanggal hari ini.
- Perhitungan `lateShipments`, `overdue`, `avgShipDays`, dan isi `attentionOrders` dilakukan BE; FE hanya menampilkan.
- Filter `status` memengaruhi bar status dan tabel order perlu perhatian saja; filter `year` memengaruhi seluruh halaman (sesuai BE).
- Jumlah seluruh status pada bar = penjualan total (definisi global, termasuk Cancelled).
- `comments` dirender sebagai teks biasa (bukan HTML) dan dipotong 160 karakter di FE (asumsi penempatan, PRD §13: BE mengirim catatan apa adanya).

**Indikasi piutang (P2)**

- Kartu hanya dirender bila `receivables` ada di respons.
- Keterbatasan yang wajib ditampilkan di UI: pembayaran di dump tidak terhubung ke order tertentu, sehingga angka ini indikasi, bukan saldo piutang akuntansi.
- Hanya jumlah customer yang melewati credit limit yang tersedia; tidak ada nama atau nilai per customer.

## Langkah Pengerjaan

**Bagian inti (P1), branch `feat/f05-operasional-order`**

- [x] 1. Buat branch `feat/f05-operasional-order` dari `main` terbaru (FE F06 dan F01 sudah ter-merge); ubah status F05 di `docs/PRD.md` §7 menjadi 🟨. _(Dikerjakan di `feature/operasional-order`, dari main yang memuat fondasi, F06, F01, F02, dan F03; PRD §7 sudah 🟨 dan kolom branch diisi.)_
- [x] 2. Tipe `Operations` di `src/types/index.ts` (`receivables` opsional); `api.operations(filter)` di `src/api/index.ts`; key di `src/api/queryKeys.ts`. _(Ditambah `Operations`, `OperationsFilter`, `AttentionOrder`, `ShippingBucket`. `receivables` belum ditambahkan: BE belum menyediakannya dan bagian piutang ditunda ke `feat/f05-piutang`. `api.operations` hanya mengirim `year` dan `status`; tes di `src/api/operations.test.ts` dan `queryKeys.test.ts`.)_
- [x] 3. Hook `useOperations` di `src/hooks/` (`staleTime: Infinity`, `keepPreviousData`) dengan filter dari `usePageFilters` (parameter: `year`, `status`). _(Filter dari `useDashboardFilter('operations')`; opsi `enabled` seperti `useGrowth`.)_
- [x] 4. Fungsi murni + test di `src/lib/`: pemotongan catatan 160 karakter, format tanggal, label bucket. _(`operations.ts` + `operations.test.ts`: `toOrderNote` (per code point, aman terhadap surrogate pair, elipsis, spasi dirapatkan), `formatOrderDate`, `describeAsOf`, `formatDays`, `toLeadTimeColumns`, `statusTone`, `isOperationsEmpty`, ringkasan teks grafik.)_
- [x] 5. Halaman di `src/pages/operations/` dibungkus `QueryState`; daftarkan route `/operasional` di `src/app/App.tsx` dan menu di `src/app/navigation.ts`. _(Route lazy; menu "Operasional" dengan ikon baru `OperationsIcon`, `page: 'operations'`.)_
- [x] 6. Pasang filter F06 (tahun, status). _(`FilterBar page="operations"`: tahun dan status.)_
- [x] 7. Lima/enam kartu KPI (Order, Terkirim, Perlu perhatian, Lewat tenggat, Rata-rata hari kirim; sertakan `lateShipments`) dengan keterangan "per {asOf}". _(Enam kartu di `OperationsKpiSection`; "Lewat tenggat" berketerangan "Belum dikirim, per {asOf}"; kartu "Terlambat dikirim" untuk `lateShipments`.)_
- [x] 8. Bar status order (jumlah order dan penjualan per status). _(Dua grafik bar horizontal terpisah karena skala jumlah dan US$ berbeda jauh: `OrdersByStatusChart` dan `SalesByStatusChart`, masing-masing dengan judul, label sumbu, legenda, dan alternatif tabel; status berikon + teks.)_
- [x] 9. Tabel order perlu perhatian (`DataTable`: no. order, tanggal order, tenggat, status, customer, nilai, catatan) dengan catatan sebagai teks biasa dipotong 160 karakter. _(`AttentionOrdersTable` + `OrderNote`: catatan sebagai child teks React (tanpa HTML), teks lengkap lewat `title` dan teks `sr-only`. Urutan dari BE (tenggat terdekat), tanpa pengurutan sisi FE.)_
- [x] 10. Histogram 4 bucket lama pengiriman dan daftar 5 pengiriman terlama; alternatif teks untuk grafik. _(`ShippingLeadTimeChart` lewat `ChartCard` + `ChartTable`; `SlowestShipments` berupa daftar berurut.)_
- [x] 11. `EmptyState`; responsif; cek CSP. _(Keadaan kosong di `OperationsContent` dan tiap grafik; `DataTable` menjadi kartu per baris di bawah `lg`; tanpa `<style>` runtime, sumber eksternal, atau `dangerouslySetInnerHTML`. Tampilan di browser belum dilihat: belum terbukti.)_
- [ ] 12. Uji manual terhadap BE lokal berisi dump, termasuk data uji berisi `<script>` pada `comments` (tidak dieksekusi, tampil sebagai teks). _(Belum dikerjakan: butuh BE lokal dan browser. Yang sudah ada baru tes unit bahwa `toOrderNote` membiarkan isi HTML sebagai teks mentah.)_
- [x] 13. `npm run lint`, `npm test`, `npm run build` hijau. _(Lint tanpa peringatan, 222 tes lulus (14 berkas), build sukses; dijalankan di branch ini sebelum commit.)_
- [ ] 14. Commit terakhir: status F05 di PRD §7 menjadi 🟩, isi kolom PR; buka PR ke `main`.

**Bagian piutang (P2), branch `feat/f05-piutang`, hanya bila Q4 disetujui dan BE `feat/f05-piutang` ter-merge**

- [ ] 15. Buat branch `feat/f05-piutang` dari `main` terbaru; status baris piutang menjadi 🟨. _(Ditunda, branch `feat/f05-piutang`.)_
- [ ] 16. Kartu "Indikasi piutang": `billed`, `paid`, `outstanding`, dan jumlah customer melewati credit limit, dirender hanya bila `receivables` ada. _(Ditunda, branch `feat/f05-piutang`; BE belum menyediakan datanya.)_
- [ ] 17. Catatan keterbatasan wajib terlihat: pembayaran tidak terhubung ke order, angka adalah indikasi, bukan saldo piutang akuntansi. _(Ditunda, branch `feat/f05-piutang`.)_
- [ ] 18. `npm run lint`, `npm test`, `npm run build` hijau; PR ke `main`, status 🟩. _(Ditunda, branch `feat/f05-piutang`.)_

## Kriteria Penerimaan

Nilai yang tampil harus sama dengan respons API; angka acuan lengkap ada di dokumen F05 repo BE.

_Catatan: belum terbukti. Kriteria inti di bawah butuh BE lokal berisi dump dan browser; di branch ini baru lolos lint, test unit (pemotongan catatan, format tanggal/hari, wadah lama pengiriman, ringkasan grafik, bentuk permintaan API), dan build. Kriteria piutang (P2) ditunda ke branch `feat/f05-piutang`._

- [ ] Bar status menampilkan: Shipped 303, Cancelled 6, In Process 6, On Hold 4, Resolved 4, Disputed 3, dengan penjualan per status yang jumlahnya 9.604.190,61.
- [ ] KPI "Perlu perhatian" = 13 dan tabel memuat 13 order (nilai total 366.005,91); 4 order On Hold beralasan credit limit terlampaui.
- [ ] KPI: rata-rata hari kirim 3,76; 1 pengiriman terlambat; 4 order lewat tenggat, berketerangan "per 31 Mei 2005".
- [ ] Histogram: 99 / 163 / 49 / 1; pengiriman terlama teratas order 10165 (65 hari).
- [ ] Catatan order yang berisi `<script>` tampil sebagai teks (diuji dengan data uji, bukan data dump) dan dipotong 160 karakter.
- [ ] (P2) Kartu piutang menampilkan tagihan 9.365.336,43; dibayar 8.853.839,23; selisih 511.497,20; 3 customer melewati credit limit, beserta catatan keterbatasan.
- [ ] Tanpa `receivables` di respons, kartu piutang tidak dirender dan halaman tidak error.

## Definisi Selesai

Langkah inti dan kriteria inti tercentang, CI hijau, status di PRD §7 = 🟩. Langkah piutang dicentang terpisah di branch `feat/f05-piutang`.
