# PRD — Axon Sales Report (Dashboard Analytics) — Repo FE

| | |
|---|---|
| Versi | 1.0 (draf), versi khusus repo FE |
| Tanggal | 5 Oktober 2026 (dipisah per repo 6 Oktober 2026) |
| Pemilik dokumen | Developer fullstack, Kelompok 2 DevSecOps |
| Repositori | **FE (repo ini)** · [BE](https://github.com/kel-2-wdevsecops/BE) |
| Pasangan dokumen | `docs/PRD.md` di repo BE. Latar belakang, tujuan, dan definisi metrik sama di kedua repo; bagian teknis dan status fitur khusus per repo |
| Rujukan | `Bahan Materi/README.md`, `Bahan Materi/Axon_Sales_Analysis_SQL.pptx`, `Bahan Materi/Axon Sales.pbix`, `Bahan Materi/Axon SQL.sql`, `Bahan Materi/Axon sales - Mysql Database.sql`, README BE & FE |

Dokumen ini mencakup scope **frontend**: halaman, grafik, filter di URL, aksesibilitas, dan tampilan. Scope API, query, dan sumber data ada di PRD repo BE.

## 0. Alur Kerja Fitur dan Pelacakan Status

Tiap fitur dikerjakan di branch bernama **sama** di kedua repo. Konvensi: `feat/<id-fitur>-<slug>`, mis. `feat/f01-ringkasan` di repo FE dan `feat/f01-ringkasan` di repo BE. Nama branch tiap fitur tertulis di tabel §7 dan di header dokumen fitur.

Cara mengetahui posisi sebuah fitur di repo ini:

1. Buka papan status di §7. Kolom **Status** menunjukkan tahap fitur, kolom **Bergantung pada** menunjukkan apa yang harus selesai lebih dulu (termasuk di repo BE).
2. Buka `docs/features/<id>-*.md`. Bagian **Langkah Pengerjaan** adalah daftar centang; langkah yang sudah dicentang `[x]` sudah selesai, langkah `[ ]` pertama adalah pekerjaan berikutnya.

Alur satu fitur:

1. Baca dokumen fitur ini dan pasangannya di repo BE. Kontrak API bersumber dari dokumen BE; dokumen FE memuat salinannya.
2. `git switch main && git pull`, lalu `git switch -c feat/<id>-<slug>`.
3. Ubah baris fitur di §7 menjadi 🟨 pada commit pertama (`docs(<id>): mulai <fitur>`).
4. Kerjakan langkah satu per satu. Centang langkahnya pada commit yang sama dengan pekerjaannya.
5. Pesan commit mengikuti Conventional Commits (dicek husky dan CI): `feat(f01): ...`, `test(f01): ...`, `docs(f01): ...`. `feat` menaikkan versi minor, `fix` patch, `docs` dan `test` tidak menaikkan versi.
6. Sebelum PR: `npm run lint`, `npm test`, `npm run build` harus lulus tanpa warning.
7. Pada commit terakhir sebelum PR, ubah status menjadi 🟩 dan isi kolom PR. Merge PR ke `main`.
8. Setelah PR rilis release-please di-merge dan deploy sukses, ubah status menjadi 🚀 (commit `docs:` terpisah).

Legenda status: ⬜ belum mulai · 🟨 sedang dikerjakan · 🟩 selesai (sudah di `main`, belum dirilis) · 🚀 dirilis.

## 1. Latar Belakang

Axon adalah retailer miniatur (scale model) mobil klasik yang menjual ke 122 pelanggan grosir di 27 negara melalui 7 kantor penjualan. Data penjualannya (pelanggan, produk, order, pembayaran, karyawan, kantor) tersimpan di MySQL, tetapi tim sales tidak punya sistem terpusat untuk mengolah dan membacanya. Akibatnya laporan lambat tersedia, rawan tidak akurat, dan manajemen sulit melihat tren pasar sebelum mengambil keputusan.

Studi kasus sebelumnya menjawab masalah ini dengan laporan Power BI tiga halaman (Home, Products, Sales) dan kumpulan query SQL analitik. Laporan Power BI itu hanya bisa dibuka di Power BI Desktop/Service, tidak bisa di-deploy sebagai aplikasi, dan tidak melalui pipeline keamanan apa pun.

Proyek ini membangun ulang solusi BI tersebut sebagai aplikasi web fullstack yang di-deploy dengan kaidah DevSecOps: frontend React interaktif dan API hanya-baca yang cepat dan aman, dengan CI/CD GitHub Actions yang sudah tersedia.

## 2. Permasalahan (sudut pandang pengguna)

1. Manajemen tidak bisa melihat kinerja penjualan (omzet, profit, pertumbuhan) secara cepat dan konsisten, sehingga keputusan diambil dari laporan yang terlambat.
2. Tim sales tidak tahu pasar, product line, produk, dan pelanggan mana yang paling berkontribusi, sehingga strategi pemasaran dan stok tidak terarah.
3. Manajer sales tidak bisa membandingkan kinerja antarperiode (tahun, kuartal, bulan) untuk menilai apakah strategi berhasil.
4. Order bermasalah (On Hold, Disputed, terlambat dikirim) tidak terlihat sampai pelanggan mengeluh.
5. Laporan Power BI yang ada tidak bisa dibagikan sebagai tautan web, dan angkanya tidak bisa diaudit ulang dengan mudah.

## 3. Tujuan dan Ukuran Keberhasilan

Tujuan bisnis (dari README studi kasus): memberdayakan Axon untuk mengambil keputusan berbasis data, memperbaiki strategi penjualan, dan meningkatkan kinerja bisnis.

| Tujuan produk | Ukuran keberhasilan | Pemilik utama |
|---|---|---|
| Angka dashboard dapat dipercaya | Semua KPI tanpa filter sama persis dengan Power BI dan dump: penjualan 9.604.190,61; profit 3.825.880,25; 122 customer; 23 karyawan; 110 produk; 326 order | BE (angka dihitung di sana), **FE** (menampilkan apa adanya, tanpa menghitung ulang) |
| Pertanyaan bisnis utama terjawab dalam ≤ 3 klik | Setiap pertanyaan di §4 punya halaman dan visual yang menjawabnya | **FE**; BE menyediakan datanya |
| Dashboard cepat | API p95 < 300 ms saat cache kosong, < 50 ms saat cache terisi; FE menampilkan data pertama < 2,5 detik di jaringan 4G | BE (p95 API), **FE** (waktu tampil) |
| Aman sesuai DevSecOps | 0 temuan High/Critical dari Semgrep, Trivy, dan ZAP pada rilis; tidak ada data pribadi (telepon, alamat, email, nama kontak) di respons API | BE (respons, SAST, DAST), **FE** (CSP, SAST FE, tidak menampilkan data pribadi) |
| Mudah diakses | Skor aksesibilitas Lighthouse ≥ 90; semua filter bisa dioperasikan dengan keyboard | **FE** |

## 4. Pengguna dan Kebutuhan

| Persona | Pertanyaan yang ingin dijawab | Fitur |
|---|---|---|
| Manajemen / eksekutif | Berapa omzet dan profit? Apakah bisnis tumbuh? Pasar mana terbesar? | F01, F03, F07 |
| Manajer sales regional (NA, EMEA, APAC) | Bagaimana kinerja negara/benua saya? Sales rep mana yang paling produktif? | F01, F04 |
| Tim marketing & produk | Product line, produk, dan vendor apa yang paling laku? Produk apa yang tidak laku? Kapan musim ramai? | F02, F07 |
| Tim operasional / fulfillment | Order mana yang tertahan atau terlambat dikirim? | F05 |

Semua persona memakai dashboard yang sama tanpa login (keputusan tim, lihat risiko R1).

## 5. Sumber Data (ringkas untuk FE)

Keputusan tim: database sistem adalah dump `Axon sales - Mysql Database.sql` (MySQL `classicmodels`), dibaca oleh BE. FE tidak pernah mengakses database, hanya memanggil API BE. Analisis lengkap tiga sumber data (dump, `Axon SQL.sql`, `Axon Sales.pbix`) dan alasannya ada di PRD repo BE §5.

Kondisi data yang memengaruhi tampilan di FE:

- Data order 6 Januari 2003 s.d. 31 Mei 2005. Tahun 2005 dan Q2 2005 adalah periode parsial dan harus diberi label di UI.
- 24 customer terdaftar belum pernah order (prospek), 22 customer tanpa sales rep.
- 1 produk tidak pernah terjual (1985 Toyota Supra, penjualan 0 tetap tampil di tabel produk).
- Nama negara sudah di-trim oleh BE; FE tidak perlu membersihkan spasi.
- Benua dipetakan di BE; daftar benua dan negara untuk filter diambil dari endpoint `/dashboard/filters` (F06), bukan ditulis ulang di FE.

## 6. Definisi Metrik Global

Definisi ini mengikat semua fitur. Tujuannya agar angka sama dengan Power BI. Definisi dihitung di BE; FE hanya menampilkannya dan memberi label yang tepat.

| Istilah | Definisi |
|---|---|
| Penjualan (sales) | `SUM(quantityOrdered × priceEach)` dari `orderdetails`, **semua status order termasuk Cancelled** (sama dengan measure `Sale` Power BI). Penjualan order Cancelled = 238.854,18 |
| Profit | `SUM(quantityOrdered × (priceEach − products.buyPrice))` (sama dengan `profit_table[profit]`) |
| Margin profit | `profit / penjualan × 100`, 2 desimal. Tanpa filter: 39,84 % |
| Order | `COUNT(DISTINCT orderNumber)` |
| Customer (terdaftar) | Baris di `customers`. Hanya terpengaruh filter geografi |
| Customer aktif | Customer dengan ≥ 1 order pada filter yang berlaku. Tanpa filter: 98 |
| Periode | Berdasarkan `orders.orderDate`. Tahun data: 2003, 2004, 2005 (2005 hanya Januari–Mei) |
| Benua | Peta negara → benua mengikuti kolom `Continent` Power BI: Europe (16 negara), North America (USA, Canada), Asia (Singapore, Japan, Hong Kong, Philippines, Russia, Israel), Oceania (Australia, New Zealand), Africa (South Africa) |
| Growth | `(nilai − nilai periode kalender sebelumnya) / nilai periode sebelumnya × 100`. Januari 2004 dibandingkan Desember 2003. Tanpa pembanding atau pembanding 0 → `null`, tampil "—" |
| Periode parsial | Periode yang berakhir setelah tanggal order terakhir (31 Mei 2005), mis. tahun 2005 dan Q2 2005. Ditandai di UI |
| Mata uang | Dolar AS, ditampilkan dengan format Indonesia (`Intl.NumberFormat('id-ID')`), mis. `US$9.604.190,61`. BE mengirim angka mentah (number), format dilakukan di FE |

## 7. Ruang Lingkup, Prioritas, dan Papan Status FE

P0 = wajib untuk UTS (setara laporan Power BI). P1 = nilai tambah yang menjawab tujuan bisnis. P2 = opsional bila waktu cukup.

Status per 6 Oktober 2026. Baseline repo FE: boilerplate v1.0.0 (shell aplikasi, sidebar, routing, client API, health check, `DataTable`, `QueryState`, nginx dengan CSP, CI/CD). Baru ada satu halaman (`/`, Beranda kerangka).

| ID | Fitur | Prio | Route FE | Branch | Bergantung pada | Status | PR | Dokumen |
|---|---|---|---|---|---|---|---|---|
| F00 | Fondasi API | P0 | – | – (tidak ada pekerjaan FE) | – | – | – | [F00](features/F00-fondasi-api-keamanan.md) |
| F06 | Filter global dan tautan berbagi | P0 | semua | `feature/filter-tautan` | BE F06 (`/filters`) | 🟨 | – | [F06](features/F06-filter-tautan.md) |
| F01 | Ringkasan penjualan | P0 | `/` | `feature/ringkasan-penjualan` | FE F06; BE F01 | 🟨 | – | [F01](features/F01-ringkasan.md) |
| F02 | Analisis produk | P0 | `/produk` | `feature/analisis-produk` | FE F06, FE F01 (komponen bersama); BE F02 | 🟨 | – | [F02](features/F02-produk.md) |
| F03 | Analisis pertumbuhan | P0 | `/pertumbuhan` | `feature/analisis-pertumbuhan` | FE F06, FE F01; BE F03 | 🟨 | – | [F03](features/F03-pertumbuhan.md) |
| F04 | Pelanggan dan tim sales | P1 | `/pelanggan` | `feature/pelanggan-tim-sales` | FE F06, FE F01; BE F04 | 🟨 | – | [F04](features/F04-pelanggan-tim-sales.md) |
| F05 | Operasional order | P1 (piutang P2) | `/operasional` | `feature/operasional-order` (piutang: `feat/f05-piutang`, ditunda) | FE F06, FE F01; BE F05 | 🟨 (piutang: ⬜ ditunda) | – | [F05](features/F05-operasional-order.md) |
| F07 | Sorotan insight dan rekomendasi | P1 | `/` (panel) | `feat/f07-sorotan-insight` | FE F01; BE F07 | ⬜ | – | [F07](features/F07-sorotan-insight.md) |

Semua data dibaca lewat `GET /api/v1/dashboard/*` di repo BE. FE tidak punya endpoint sendiri. Status BE dilacak di PRD repo BE.

## 8. Di Luar Ruang Lingkup

- Login, akun, peran (RBAC), dan endpoint tulis (create/update/delete).
- ETL, sinkronisasi, atau data real-time. Data adalah dump statis; "akses terkini" berarti dashboard membaca langsung dari database dengan cache maksimal 5 menit.
- Forecasting/machine learning, ekspor PDF/Excel, notifikasi email.
- Halaman detail per customer dan per karyawan (berisi data pribadi).
- Perubahan skema database (tabel/view/index tambahan) dan stored procedure.

## 9. Kebutuhan Non-Fungsional (sisi FE)

**Keamanan (DevSecOps)**

- FE tidak menampilkan atau menyimpan data pribadi; hanya memakai field yang ada di kontrak API.
- Lapisan yang sudah ada dipertahankan: CSP ketat di nginx (`script-src 'self'`, `style-src 'self'`, `font-src 'self'`, tanpa CDN atau font eksternal), `X-Frame-Options: DENY`, `nosniff`, container non-root, Semgrep (OWASP + React), Gitleaks, Trivy, SBOM, Cosign, provenance, ZAP.
- Tidak ada library yang menyuntikkan tag `<style>` saat runtime; cek konsol browser pada image produksi setelah menambah dependency.
- Teks dari API (mis. catatan order) dirender sebagai teks biasa, bukan HTML.

**Performa**

- Halaman di-lazy-load per route; `staleTime: Infinity` dan `keepPreviousData` agar grafik tidak berkedip saat filter berganti.
- FE menampilkan data pertama < 2,5 detik di jaringan 4G.

**Keandalan dan observabilitas**

- `/version.json` dipakai health check deploy dan rollback otomatis.

**Aksesibilitas dan UX**

- Responsif (mobile, tablet, desktop) memakai `AppShell` yang ada.
- Setiap grafik punya judul, label sumbu, dan alternatif teks (ringkasan atau tabel).
- Kontras warna memenuhi WCAG AA; warna lewat token di `src/index.css`.
- Status loading, error, dan kosong ditangani `QueryState`/`EmptyState`.

**Kualitas**

- Fungsi murni (format angka, parse filter, olah data grafik) ber-unit test Vitest di `src/lib/`.
- Lint tanpa warning, typecheck, Conventional Commits (sudah ditegakkan CI dan husky).
- Angka yang tampil diverifikasi terhadap BE lokal yang berisi dump (angka acuan ada di dokumen fitur BE).

Kebutuhan validasi, cache, dan minimasi data di sisi API ada di PRD repo BE.

## 10. Arsitektur Ringkas

```text
Browser ──HTTPS──> Cloudflare ──Tunnel──> devsecops_fe (nginx :8080, SPA + CSP)   <── repo ini
                                              │ /api/
                                              ▼
                                         devsecops_be (Express :3008)
                                              │ SELECT-only
                                              ▼
                                         mysql (classicmodels)
```

- **FE**: alur satu arah komponen → hook (`src/hooks`) → `api.*` (`src/api/index.ts`) → `http`. Halaman di `src/pages/<nama>/`, filter di query string URL, grafik Recharts. Satu request per perubahan filter karena BE menyediakan satu endpoint per halaman.
- Struktur modul BE (`routes`, `controller`, `dto`, `service`) dijelaskan di PRD repo BE.

## 11. Rencana Rilis

Setiap rilis melalui PR fitur → CI → merge ke `main` → PR rilis release-please → deploy.

Repo FE dan BE punya versi sendiri (release-please per repo, saat ini FE 1.0.0 dan BE 1.0.1), jadi nomor di tabel adalah **gelombang rilis**: tahan PR rilis tetap terbuka sampai semua fitur dalam gelombang itu ter-merge, lalu merge sekali. Nomor versi aktual ditentukan release-please dari pesan commit.

| Gelombang | Isi (FE) |
|---|---|
| v1.1.0 | F06, F01 |
| v1.2.0 | F02, F03 |
| v1.3.0 | F04, F05 (tanpa bagian piutang) |
| v1.4.0 | F07, bagian piutang F05 bila disetujui |

Urutan rilis antar repo: rilis BE lebih dulu atau bersamaan dengan FE pada gelombang yang sama. Deploy FE yang memanggil endpoint yang belum ada di BE produksi akan menampilkan halaman gagal muat.

## 12. Asumsi, Risiko, dan Pertanyaan Terbuka

Asumsi:

- A1. Data tidak berubah selama proyek; cache 5 menit dapat diterima.
- A2. `buyPrice` adalah harga beli saat ini dan dipakai untuk semua periode (tidak ada harga historis), sama dengan Power BI.
- A3. Filter waktu Power BI diasumsikan berbasis `orderDate`. Relasi tabel `Date` ke `orders` tidak terdeteksi saat model `.pbix` dibaca, jadi perilaku slicer tahun di Power BI tidak bisa diverifikasi; definisi di §6 yang berlaku.
- A4. (Terselesaikan oleh pemisahan dokumen) Folder `docs/` sebelumnya berada di root `project-uts` yang bukan repositori git. Sekarang dokumen ada di `docs/` di dalam repo BE dan FE sehingga ikut ter-versi.

Risiko:

- R1. **Dashboard publik berisi data bisnis.** Keputusan tim adalah tanpa login. Mitigasi: minimasi data di BE, rate limit, tanpa halaman detail per orang. Bila data dianggap rahasia, perlu autentikasi (di luar ruang lingkup saat ini).
- R2. Angka berbeda dengan Power BI karena perbedaan definisi (Cancelled, benua, periode). Mitigasi: definisi §6 dikunci dan dicek dengan tes angka emas di BE.
- R3. ZAP pada DB kosong memicu error 500 di BE. Dari sisi FE: respons kosong/nol harus tampil sebagai keadaan kosong (`EmptyState`), bukan error.

Pertanyaan terbuka (perlu keputusan tim; dampak ke FE di kolom kanan):

| # | Pertanyaan | Default dokumen ini | Dampak di FE |
|---|---|---|---|
| Q1 | Apakah order Cancelled tetap dihitung dalam penjualan (paritas Power BI) atau dikecualikan? | Dihitung, dan nilainya ditampilkan terpisah di F05 | Label "Penjualan" dan keterangan di F05 (angka berasal dari BE) |
| Q2 | Russia dan Israel dikelompokkan ke Asia mengikuti Power BI. Tetap begitu? | Tetap di Asia | Tidak ada; pengelompokan dari BE |
| Q3 | Apakah nama sales rep boleh ditampilkan di dashboard publik (F04)? | Boleh | Kolom nama di tabel/bar sales rep (F04) |
| Q4 | Apakah bagian piutang F05 (P2) dikerjakan? | Belum diputuskan | Kartu "Indikasi piutang" di F05 (branch `feat/f05-piutang`) |

## 13. Catatan Pemisahan Dokumen dan Asumsi Penempatan

Dokumen ini dan dokumen fitur di `docs/features/` dipisah dari dokumen gabungan FE+BE. Isi dan substansi fitur tidak diubah; hanya dipilah per repo. Bagian yang ambigu diputuskan sebagai berikut:

- **Kontrak API.** Sumber kebenaran ada di dokumen fitur BE. Dokumen fitur FE memuat salinan yang sama supaya FE bisa dikerjakan tanpa membuka repo lain. Bila kontrak berubah, ubah di dokumen BE lebih dulu, lalu samakan di dokumen FE pada branch FE.
- **F00.** Seluruhnya scope BE. Dokumen F00 di repo ini hanya catatan bahwa tidak ada pekerjaan FE.
- **Komponen bersama FE** (kartu KPI, pembungkus grafik dengan alternatif teks, pemformat angka) tidak disebut eksplisit di dokumen asli. Diasumsikan dibuat di F01 sebagai pengguna pertama dan dipakai ulang F02–F05.
- **F06 di FE** dibangun lebih dulu dan dipasang di halaman `/` yang sudah ada agar bisa dicoba. Kriteria yang butuh halaman `/produk` dan `/pertumbuhan` baru bisa dibuktikan saat F02 dan F03 ter-merge.
- **Pemotongan catatan order 160 karakter dan render teks biasa (F05)** diasumsikan tugas FE, karena tercantum di bagian Tampilan. BE mengirim catatan apa adanya.
- **Nama bulan dan pengelompokan "Lainnya"** (F01, F06) adalah tugas FE sesuai dokumen asli.
- **F05 piutang (P2)** dikerjakan di branch terpisah `feat/f05-piutang` karena jadwal rilisnya berbeda.
- **Dokumen gabungan lama** di `project-uts/docs/` (root, di luar git) tidak diubah dan tidak dihapus.
