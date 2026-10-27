/// <reference types="vitest/config" />
import { readFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

const file = (path: string) => fileURLToPath(new URL(path, import.meta.url))

/** Versi rilis dari package.json (dinaikkan release-please), lihat src/lib/appVersion.ts. */
const version: string = JSON.parse(readFileSync(file('./package.json'), 'utf8')).version

/**
 * Menulis dist/version.json saat build. Dibaca health check staging & deploy untuk
 * memastikan container yang jalan memang versi yang baru dirilis (sama
 * seperti `version` di GET /api/v1/health milik BE).
 */
function versionFile(): Plugin {
  return {
    name: 'version-file',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version }) })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss(), versionFile()],
    define: { __APP_VERSION__: JSON.stringify(version) },
    resolve: {
      alias: { '@': file('./src') },
    },
    server: {
      // Dev: FE memanggil /api/v1 di origin yang sama, diteruskan ke BE lokal.
      // Di produksi peran ini diambil nginx (nginx/default.conf.template).
      proxy: {
        '/api': { target: env.VITE_DEV_API_TARGET || 'http://localhost:3008', changeOrigin: true },
      },
    },
    build: {
      rolldownOptions: {
        output: {
          // Library grafik (recharts + d3 + redux toolkit-nya) jarang berubah,
          // jadi dipisah dari kode aplikasi: rilis FE baru tidak memaksa
          // browser mengunduh ulang ~420 kB yang sama. React ikut dipisah.
          codeSplitting: {
            groups: [
              { name: 'charts', test: /node_modules[\\/](recharts|d3-[^\\/]+|victory-vendor|@reduxjs|immer|reselect|es-toolkit|decimal\.js-light|eventemitter3)[\\/]/ },
              { name: 'react', test: /node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|@tanstack)[\\/]/ },
            ],
          },
        },
      },
      // Chunk grafik memang ~420 kB sebelum gzip (~120 kB gzip).
      chunkSizeWarningLimit: 600,
    },
    test: {
      include: ['src/**/*.test.ts'],
      environment: 'node',
    },
  }
})
