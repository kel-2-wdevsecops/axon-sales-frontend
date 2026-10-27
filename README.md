# Axon Sales Dashboard (FE)

Kerangka (boilerplate) dashboard **publik** penjualan Axon dari database `classicmodels`, yang akan meniru tiga halaman laporan Power BI Axon: Ringkasan, Produk, dan Pertumbuhan. Tidak ada login: semua halaman terbuka, dan datanya hanya dibaca dari [Axon Sales API](https://github.com/kel-2-wdevsecops/BE). Spesifikasi isi tiap halaman dan definisi angkanya ada di bagian "Target dashboard" README BE.

Repo ini baru berisi fondasi: shell aplikasi (sidebar, routing, layout responsif), client API, health check, komponen generik, nginx dengan header keamanan, dan pipeline CI/CD.

Stack: React 19, TypeScript, Vite 8, Tailwind v4, React Router 7, TanStack Query 5, Recharts 3 (terpasang, belum dipakai), Zustand, axios, Vitest.

## Menjalankan di lokal

1. Jalankan BE di `http://localhost:3008` (lihat README repo BE).
2. Install dependency, lalu jalankan:
   ```bash
   npm install
   npm run dev
   ```
3. Buka `http://localhost:5173`. Halaman Beranda menampilkan status API.

FE selalu memanggil `/api/v1` di origin yang sama. Saat `npm run dev`, Vite meneruskannya ke BE lokal. Kalau BE tidak di `localhost:3008`, salin `.env.example` ke `.env.local` lalu isi `VITE_DEV_API_TARGET`.

Setelah dependency berubah (`npm install`), restart `npm run dev`. Kalau tidak, browser bisa mendapat 504 "Outdated Optimize Dep" dan halaman kosong.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server dev dengan HMR |
| `npm run build` | Typecheck (`tsc -b`) + build ke `dist/` |
| `npm run typecheck` | Typecheck saja |
| `npm test` | Unit test Vitest (`src/**/*.test.ts`, fungsi murni) |
| `npm run lint` | ESLint, warning pun gagal (sama dengan CI) |
| `npm run preview` | Sajikan hasil build |

## Struktur

```text
src/
  main.tsx        entry: QueryClient, Router
  app/            App.tsx (routing), navigation.ts (menu sidebar), queryClient.ts
  api/            SATU-SATUNYA lapisan yang bicara ke BE: http.ts (axios),
                  index.ts (endpoint), queryKeys.ts
  hooks/          react-query di atas api/ (useHealth sebagai contoh)
  components/     komponen yang tidak tahu endpoint apa pun:
                  layout/ (AppShell, Sidebar, PageHeader), table/ (DataTable),
                  ui/ (Spinner, EmptyState), feedback/ (QueryState)
  pages/<halaman>/ halaman + components/ miliknya (baru ada home/)
  store/          zustand: useUiStore (drawer sidebar mobile)
  lib/            fungsi murni + test (cn, versi, terjemahan pesan BE)
  types/          tipe respons BE
```

## Menambah halaman

1. **Tipe** respons BE di `src/types/index.ts`.
2. **API**: endpoint di `src/api/index.ts`, mis. `overview: (filter) => http.get<Overview>('/dashboard/overview', { ...filter })`. Array dikirim sebagai key berulang (`productLine=a&productLine=b`). Key react-query di `src/api/queryKeys.ts`.
3. **Hook** di `src/hooks/`. Data dashboard tidak berubah, jadi `staleTime: Infinity`; pakai `placeholderData: keepPreviousData` supaya grafik lama tetap tampil saat filter berganti.
4. **Halaman** di `src/pages/<nama>/`, bungkus data dengan `QueryState` (loader + pesan gagal). Daftarkan route di `App.tsx` dan menunya di `navigation.ts`.
5. **Filter** sebaiknya disimpan di query string URL (`useSearchParams`), supaya tampilan bisa dibagikan sebagai tautan.

Aturan:
- Format angka Indonesia (`Intl.NumberFormat('id-ID')`); uang data classicmodels dalam dolar AS.
- Warna lewat token di `src/index.css` (`bg-accent`, `text-ink-muted`, ...), bukan `gray-*`.
- **CSP nginx ketat** (`style-src 'self'`, `font-src 'self'`, `script-src 'self'`): tanpa Google Fonts/CDN, dan tanpa library yang menyuntikkan tag `<style>` saat runtime. Recharts aman (gaya dipasang lewat React). Cek konsol browser di image produksi setelah menambah dependency.
- Fungsi murni (format, parse filter, olah data grafik) di `src/lib/` dengan test `*.test.ts`.

## Produksi & keamanan

Image produksi berisi nginx-unprivileged (non-root, port 8080) dan hasil build statis:
- **Header keamanan** (`nginx/default.conf.template`): CSP ketat (script dan style hanya dari origin sendiri, tanpa `'unsafe-inline'`), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- **Fallback SPA**: semua route dijawab `index.html` (tidak di-cache). Aset ber-hash di-cache selamanya.
- **Proxy `/api/`** ke BE (`API_UPSTREAM`, default `http://devsecops_be:3008` di network `uts-net`). Nama BE di-resolve ulang saat runtime (`resolver`), jadi FE tidak perlu di-restart setelah BE di-deploy ulang, dan tetap bisa start walau BE belum ada.
- `/version.json` dipakai health check deploy.

## CI/CD

Sama dengan repo BE. Alur setiap push ke `main`: **ci → build → staging → release → deploy**.
- **PR ke `main`** (`ci.yml`): commitlint, lint, `npm audit`, test, typecheck & build, Semgrep (OWASP + React), Gitleaks, Trivy fs, SBOM.
- **Push ke `main`** (`release.yml`):
  1. `ci.yml` dijalankan lagi.
  2. `build.yml`: build image, scan image (Trivy), DAST (ZAP ke nginx), push `:<sha>` ke GHCR, Cosign, provenance.
  3. `staging.yml`: verifikasi tanda tangan dan provenance, deploy by digest ke VPS staging lewat SSH, health check `/version.json`, rollback otomatis. Stack VPS (MariaDB, BE, FE, cloudflared) dan panduannya ada di `staging/` repo BE.
  4. release-please membuka atau memperbarui **PR rilis**, atau membuat tag `vX.Y.Z` kalau PR rilis baru di-merge.
- **PR rilis di-merge** (`deploy.yml`): digest yang sama dengan yang lolos staging diberi tag `:X.Y.Z` dan `:latest` (tanpa build ulang), lalu verifikasi di server produksi, deploy by digest, health check `/version.json`, dan rollback otomatis.

Deploy produksi **hanya** terjadi saat PR rilis di-merge; staging menerima setiap push ke `main`. Pesan commit wajib Conventional Commits: dicek hook husky dan CI, dan dipakai release-please untuk menentukan versi.

### Persiapan server (sekali, sebelum merge PR rilis pertama)

Server: self-hosted runner Windows. Folder FE terpisah dari BE: `D:\.server\kuliah\d4\devsecops\uts\fe`. Workflow membuatnya sendiri dan menyalin `compose.yaml` ke sana.

1. FE, BE, cloudflared, dan MySQL berada di network Docker `uts-net` (topologi lengkapnya di README BE). Workflow deploy membuat network itu kalau belum ada.
2. **Tidak ada port yang di-publish ke host.** Arahkan public hostname di Cloudflare Tunnel ke `http://devsecops_fe:8080`. Health check deploy berjalan di dalam container (`docker compose exec`).
3. BE memakai `BEHIND_CLOUDFLARE=true` dan membaca IP pengunjung dari header `CF-Connecting-IP` yang diteruskan nginx. Karena itu FE tidak boleh bisa dijangkau tanpa lewat Cloudflare.
4. Secret `NTFY_TOPIC` (opsional) dan pengaturan Actions sama dengan repo BE. "Allow GitHub Actions to create and approve pull requests" harus menyala untuk release-please.
