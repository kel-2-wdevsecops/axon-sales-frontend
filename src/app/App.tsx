import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Spinner } from '@/components/ui/Spinner';

// Halaman dimuat saat dibutuhkan: Recharts (~420 kB) tidak ikut bundel awal.
const HomePage = lazy(() => import('@/pages/home/HomePage').then((m) => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import('@/pages/products/ProductsPage').then((m) => ({ default: m.ProductsPage })));
const GrowthPage = lazy(() => import('@/pages/growth/GrowthPage').then((m) => ({ default: m.GrowthPage })));

/** Dashboard publik: semua halaman terbuka, tanpa login. */
export function App() {
  return (
    <AppShell>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/produk" element={<ProductsPage />} />
          <Route path="/pertumbuhan" element={<GrowthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
