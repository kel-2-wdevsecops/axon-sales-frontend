import { FilterBar } from '@/components/filters/FilterBar';
import { QueryState } from '@/components/feedback/QueryState';
import { PageHeader } from '@/components/layout/PageHeader';
import { useDashboardFilter } from '@/hooks/useDashboardFilter';
import { useProducts } from '@/hooks/useProducts';
import { ProductsContent } from './ProductsContent';

/**
 * Analisis produk (F02, route `/produk`): filter, KPI, grafik, dan tabel produk.
 * Angka datang dari BE (GET /dashboard/products); FE hanya memformat dan menyusun tampilan.
 */
export function ProductsPage() {
  const { filter, options, optionsLoading, hasFilter, setFilter } = useDashboardFilter('products');
  // Tunggu pilihan filter agar nilai dari URL yang tidak valid dibuang dulu, bukan dikirim ke BE (422).
  const products = useProducts(filter, { enabled: !optionsLoading });
  const isLoading = products.data === undefined && !products.error;

  return (
    <>
      <PageHeader
        title="Analisis Produk"
        subtitle="Product line, produk, dan vendor yang menghasilkan penjualan, kapan order ramai, dan stok yang menipis."
      />

      <FilterBar page="products" updating={products.isPlaceholderData} />

      <QueryState isLoading={isLoading} error={products.error}>
        {products.data && (
          <ProductsContent data={products.data} filter={filter} options={options} hasFilter={hasFilter} onFilter={setFilter} />
        )}
      </QueryState>
    </>
  );
}
