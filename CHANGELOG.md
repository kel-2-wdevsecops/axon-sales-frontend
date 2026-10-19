# Changelog

## [1.1.0](https://github.com/kel-2-wdevsecops/axon-sales-frontend/compare/v1.0.0...v1.1.0) (2026-10-18)


### Features

* **customers:** bangun halaman Pelanggan dan Tim Sales, muat lazy ([926059b](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/926059bafce5482570737849a81dd1ab2ff015dd))
* **customers:** tambah tipe, API, hook, dan pengolah data pelanggan beserta tes ([743102e](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/743102e291f4286ab3b6ec528bd078e640aca5cc))
* **dashboard:** tambah tipe respons dan pemanggil API filters dan overview ([86af3ae](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/86af3aea29044ad68ef91693bc38e7ac8dc03146))
* **filter:** tambah hook filter dan komponen FilterBar ([cce5803](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/cce5803c4cf3d33fbbb75e51bcd85d1c887f8f22))
* **filter:** tambah state filter URL, helper periode, dan clipboard beserta tes ([e101122](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/e1011229b5e25b7173d5e59ca15eeef9e16c7749))
* **growth:** bangun halaman Pertumbuhan dengan kartu YTD, tabel, dan grafik ([e2142c3](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/e2142c3017111b0330f0275ce66055c7be3b2fdd))
* **growth:** tambah tipe, pemanggil API, hook, serta pemformat pertumbuhan dan tanggal beserta tes ([9dcf8ab](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/9dcf8ab5edb7000e99d0ff86cf6ab58dad0f6d6e))
* **insights:** pasang panel Sorotan di halaman Ringkasan ([4a915b8](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/4a915b841ef00e1260bcaa604e66ec016d81e14d))
* **insights:** tambah tipe, API, hook, dan validasi tautan insight beserta tes ([a94971c](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/a94971c14bd7718d18849da9e165826b8b83c758))
* **layout:** pasang FilterBar dan pertahankan query string saat navigasi ([1ce3193](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/1ce3193642c0e60cffeea959d2eb3e1efa9b7732))
* **lib:** tambah pemformat angka id-ID dan parser filter URL beserta tes ([1a7a714](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/1a7a7148730a9d7bbd28dc982512c17bea004203))
* **operations:** bangun halaman Operasional Order, muat lazy ([c8a1d3c](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/c8a1d3c511ab2b189e5710b72d4e2fd71e6e49f6))
* **operations:** tambah tipe, API, hook, dan pengolah data operasional beserta tes ([6173acb](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/6173acb03804c5e89308035b5a05b200f870f4e6))
* **overview:** bangun halaman Ringkasan dengan KPI dan grafik, muat lazy ([1f70453](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/1f70453ef40f54661b8b44fe71483c7b2d17aa24))
* **overview:** tambah hook useOverview, tabel alternatif, dan tema grafik ([ea57822](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/ea57822176627e660dc4e48dcb14ca509aafb70b))
* **overview:** tambah pemformat ringkas dan pengolah data grafik beserta tes ([cfe8a25](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/cfe8a2592f7e84174f3858c7ea59b04df1e2df7a))
* **products:** bangun halaman Analisis Produk dengan KPI, grafik, dan tabel produk, muat lazy ([2936ac7](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/2936ac7aec9be183f8db9daf1e5add83ecd90bd7))
* **products:** tambah tipe, pemanggil API, hook, serta pencarian dan pengolah grafik beserta tes ([fa45f84](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/fa45f84b78006d1d4f0ceaff477254cd9e64661d))
* **table:** dukung pengurutan kolom pada DataTable ([2d94dc8](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/2d94dc8d2d09e1d355f33b957b4b2e8185b2c154))
* **ui:** tambah komponen KpiCard dan ChartCard dengan alternatif teks ([d269d9f](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/d269d9fccce3006d3bbad8dd1331aa0441e4c108))


### Bug Fixes

* **navigation:** remove extraneous comma in NAV array ([9053b87](https://github.com/kel-2-wdevsecops/axon-sales-frontend/commit/9053b879eddf44f2028b47ab195aebe57082d092))

## 1.0.0 (2026-10-05)


### Features

* **auth:** masuk, refresh token otomatis, keluar, dan halaman akun ([d7dedaa](https://github.com/kel-2-wdevsecops/FE/commit/d7dedaa096b79663a9fbc791ef54d38dcfe05e65))
* kerangka aplikasi, lapisan API, dan halaman beranda status sistem ([a1bf244](https://github.com/kel-2-wdevsecops/FE/commit/a1bf244e3a073b08f5f30e9fa22c4381b117e005))
* **offices:** modul CRUD kantor sebagai contoh pola modul ([c70c2e2](https://github.com/kel-2-wdevsecops/FE/commit/c70c2e25595cf6447a0194d52bee216d89487094))
* **users:** kelola akun pengguna untuk admin ([a1bd271](https://github.com/kel-2-wdevsecops/FE/commit/a1bd27190af093864c3fd7d0974fc9243e7341f4))


### Bug Fixes

* **deploy:** jalankan FE di network uts-net tanpa port terbuka ([8963b16](https://github.com/kel-2-wdevsecops/FE/commit/8963b1651faae2e8541458fcd436fa666af5bd25))
* **nginx:** resolve ulang alamat BE saat runtime ([b7ef5dd](https://github.com/kel-2-wdevsecops/FE/commit/b7ef5ddb9383c1a9614a8b63ed4ebb4db71a1a49))
