# F06 — Filter Global dan Tautan Berbagi (FE)

| | |
|---|---|
| Prioritas | P0 |
| Repo / branch | FE · `feat/f06-filter-tautan` |
| Pasangan BE | `feat/f06-filter-tautan` di repo BE (endpoint `GET /api/v1/dashboard/filters`) |
| Bergantung pada | BE F06 ter-merge (atau BE lokal berjalan dengan endpoint-nya). Fitur FE ini dikerjakan **sebelum** F01–F05 FE |
| Dipakai oleh | FE F01–F05 (dan F07 lewat F01) |
| Status | ⬜ Belum mulai |

## Tujuan

Memberi satu cara memfilter yang konsisten di semua halaman, dan membuat setiap tampilan bisa dibagikan sebagai tautan. Ini menggantikan slicer Power BI.

## User Stories

- Sebagai pengguna, saya ingin memilih tahun, bulan, benua, negara, product line, atau status dari daftar yang tersedia agar tidak salah ketik.
- Sebagai manajer, saya ingin mengirim tautan dashboard yang sudah terfilter ke rekan agar ia melihat tampilan yang sama.
- Sebagai pengguna, saya ingin melihat filter apa yang sedang aktif dan menghapusnya sekaligus.

## Cakupan Branch Ini

Seluruh perilaku filter di sisi FE: parsing dan normalisasi URL, hook, komponen filter, chip aktif, navigasi yang membawa parameter, dan aksesibilitas. Sumber daftar pilihan adalah endpoint BE `/dashboard/filters`.

Dipasang di halaman `/` yang sudah ada agar bisa dicoba selama F01 belum ada (asumsi penempatan, lihat PRD §13). Pemasangan di `/produk`, `/pertumbuhan`, `/pelanggan`, `/operasional` dilakukan di branch fitur halaman masing-masing.

## Filter per Halaman

| Parameter URL | Nilai | F01 | F02 | F03 | F04 | F05 |
|---|---|:-:|:-:|:-:|:-:|:-:|
| `year` | 2003–2005 | ✓ | ✓ | ✓ | ✓ | ✓ |
| `month` | 1–12 | ✓ | ✓ | | | |
| `continent` | 5 benua | ✓ | | | ✓ | |
| `country` | 27 negara | ✓ | | | ✓ | |
| `productLine` (boleh berulang) | 7 product line | | ✓ | | | |
| `status` | 6 status | | | | | ✓ |

## Kontrak API (salinan dari dokumen BE; BE adalah sumber kebenaran)

`GET /api/v1/dashboard/filters` (tanpa parameter)

```json
{
  "dataRange": { "from": "2003-01-06", "to": "2005-05-31" },
  "years": [2003, 2004, 2005],
  "continents": ["Africa", "Asia", "Europe", "North America", "Oceania"],
  "countries": [{ "country": "Australia", "continent": "Oceania" }],
  "productLines": ["Classic Cars", "Motorcycles", "Planes", "Ships", "Trains", "Trucks and Buses", "Vintage Cars"],
  "statuses": ["Cancelled", "Disputed", "In Process", "On Hold", "Resolved", "Shipped"]
}
```

`years`, `countries`, `productLines`, dan `statuses` diambil dari DB; nama bulan dibuat di FE (`Intl.DateTimeFormat('id-ID')`).

## Perilaku FE

- State filter disimpan di query string (`useSearchParams`), bukan di Zustand. Komponen membaca filter lewat satu hook, mis. `usePageFilters(schemaHalaman)`.
- Parsing URL lewat fungsi murni di `src/lib/filters.ts`: nilai tidak valid atau tidak berlaku di halaman itu dibuang, lalu URL diganti (`replace`) dengan versi bersih. Pengguna tidak pernah melihat halaman error karena tautan rusak.
- Pilihan negara menyempit sesuai benua terpilih. Mengganti benua menghapus negara yang tidak termasuk benua itu.
- Product line memakai multi-select; urutan di URL dinormalisasi (diurutkan) agar key cache react-query dan BE sama.
- Baris "filter aktif" menampilkan chip per filter dengan tombol hapus, plus tombol "Reset".
- Pindah halaman lewat sidebar membawa parameter yang berlaku di halaman tujuan (mis. `year` dibawa dari Ringkasan ke Pertumbuhan, `country` tidak).
- Interaksi silang: klik elemen grafik (bar negara, irisan benua, bar product line) mengubah filter yang sama dengan memilihnya dari dropdown.
- Grafik lama tetap tampil (`keepPreviousData`) dengan indikator kecil "memperbarui…" saat filter berubah.

## Aksesibilitas

- Setiap kontrol punya `<label>` yang terlihat; bisa dioperasikan penuh dengan keyboard (Tab, panah, Enter, Escape).
- Perubahan hasil diumumkan lewat region `aria-live="polite"` (mis. "Menampilkan data tahun 2004").
- Chip filter adalah `<button>` dengan `aria-label` "Hapus filter Tahun 2004".

## Langkah Pengerjaan

- [x] 1. Buat branch `feat/f06-filter-tautan` dari `main` terbaru; ubah status F06 di `docs/PRD.md` §7 menjadi 🟨. (Catatan: branch aktual `feature/filter-tautan` mengikuti konvensi Git Flow, bertumpuk di atas `feature/fondasi-dashboard`; langkah 2 dikerjakan di branch fondasi.)
- [x] 2. Tipe `FilterOptions` di `src/types/index.ts`; endpoint `api.filters` di `src/api/index.ts`; key di `src/api/queryKeys.ts`.
- [x] 3. Hook `useFilterOptions` di `src/hooks/` (`staleTime: Infinity`).
- [x] 4. `src/lib/filters.ts` (fungsi murni): skema parameter per halaman (tabel "Filter per Halaman"); parse query string; buang nilai tidak valid atau tidak berlaku di halaman itu; normalisasi (`productLine` diurutkan dan di-dedup); penyempitan negara menurut benua dan penghapusan negara yang bukan bagian benua terpilih; pemindahan parameter antarhalaman (hanya yang berlaku di halaman tujuan).
- [x] 5. `src/lib/filters.test.ts`: parsing, pembuangan nilai tidak valid, normalisasi urutan, pemindahan parameter antarhalaman, penyempitan negara.
- [x] 6. Hook `usePageFilters(schemaHalaman)` di `src/hooks/`: membaca `useSearchParams`, memakai parser murni, mengganti URL dengan `replace` bila ada nilai yang dibuang/dinormalisasi, menyediakan `setFilter`, `removeFilter`, `reset` (untuk dropdown, chip, dan klik grafik). (Catatan: hook bernama `useDashboardFilter`; helper murni tambahan di `src/lib/filterState.ts`, `period.ts`, `clipboard.ts`.)
- [x] 7. Komponen filter (mis. `src/components/filters/`): kontrol per parameter dengan `<label>` terlihat; multi-select product line; pilihan negara menyempit menurut benua; dapat dioperasikan dengan keyboard (Tab, panah, Enter, Escape).
- [x] 8. Baris "filter aktif": chip `<button>` dengan `aria-label` "Hapus filter Tahun 2004" dan tombol "Reset".
- [x] 9. Region `aria-live="polite"` yang mengumumkan hasil (mis. "Menampilkan data tahun 2004") dan indikator kecil "memperbarui…" saat `isFetching` dengan data lama tetap tampil.
- [x] 10. Navigasi: `Sidebar`/`SidebarNavItem`/`navigation.ts` membawa parameter yang berlaku di halaman tujuan.
- [x] 11. Nama bulan dengan `Intl.DateTimeFormat('id-ID')`.
- [ ] 12. Pasang di halaman `/` yang ada untuk uji manual terhadap BE lokal; pastikan tidak ada pelanggaran CSP di konsol (tanpa library yang menyuntikkan `<style>`). (Belum dicentang: diuji pada build produksi lewat `vite preview` dengan API tiruan, 0 tag `<style>` runtime, tetapi bukan terhadap BE lokal dan konsol CSP belum diperiksa pada image nginx.)
- [x] 13. `npm run lint`, `npm test`, `npm run build` hijau.
- [ ] 14. Commit terakhir: status F06 di PRD §7 menjadi 🟩, isi kolom PR; buka PR ke `main`.

## Kriteria Penerimaan

- [ ] Membuka `/produk?productLine=Ships&productLine=Classic%20Cars&year=2004` menampilkan data terfilter, dan URL dinormalisasi menjadi urutan product line alfabetis. (Dibuktikan penuh saat FE F02 ter-merge; di F06 lewat unit test dan uji di halaman `/`.)
- [x] `/?year=abc&country=Atlantis` dibuka tanpa error; parameter tidak valid dibuang dari URL.
- [x] Memilih benua Oceania membuat pilihan negara hanya Australia dan New Zealand.
- [x] Tombol Reset menghapus semua parameter halaman itu.
- [ ] Navigasi Ringkasan `?year=2004&country=USA` → Pertumbuhan menghasilkan `/pertumbuhan?year=2004`. (Dibuktikan penuh saat FE F03 ter-merge.)
- [ ] Semua filter bisa dipakai tanpa mouse.
- [x] Unit test `src/lib/filters.ts`: parsing, pembuangan nilai tidak valid, normalisasi urutan, pemindahan parameter antarhalaman.

## Definisi Selesai

Langkah dan kriteria yang bisa dibuktikan tercentang, CI hijau (lint, test, build, Semgrep, Trivy, Gitleaks), status di PRD §7 = 🟩. Kriteria yang menunggu halaman lain tercatat di PR dan dicentang di PR F02/F03.
