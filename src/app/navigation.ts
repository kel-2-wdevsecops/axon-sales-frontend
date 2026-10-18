import type { ComponentType, SVGProps } from 'react';
import { HomeIcon, ProductsIcon, TrendingUpIcon } from '@/components/layout/icons';
import type { FilterPage } from '@/lib/filters';

export interface NavEntry {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /**
   * Skema filter halaman tujuan (PAGE_FILTER_KEYS). Dengan ini tautan sidebar
   * membawa filter yang berlaku di halaman itu; tanpa ini tidak ada yang dibawa.
   */
  page?: FilterPage;
}

/** Menu sidebar: satu entri per halaman dashboard. */
export const NAV: NavEntry[] = [
  
  { to: '/', label: 'Ringkasan', icon: HomeIcon, page: 'overview' },
  { to: '/produk', label: 'Produk', icon: ProductsIcon, page: 'products' },
,
  { to: '/pertumbuhan', label: 'Pertumbuhan', icon: TrendingUpIcon, page: 'growth' },
];
