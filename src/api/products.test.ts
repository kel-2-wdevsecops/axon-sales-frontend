import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { ProductsFilter } from '@/types';

// Memastikan bentuk permintaan ke BE tanpa jaringan: adapter axios dipasang
// sebelum client `http` dibuat, lalu URL yang sebenarnya dikirim dibaca dari
// konfigurasi akhir (termasuk serializer parameter milik client).

let sent: InternalAxiosRequestConfig | undefined;
let api: typeof import('@/api').api;

beforeAll(async () => {
  axios.defaults.adapter = async (config) => {
    sent = config;
    return { data: { success: true, message: 'OK', data: {} }, status: 200, statusText: 'OK', headers: {}, config };
  };
  ({ api } = await import('@/api'));
});

beforeEach(() => {
  sent = undefined;
});

async function requestUrl(filter?: ProductsFilter): Promise<URL> {
  await api.products(filter);
  if (!sent) throw new Error('permintaan tidak terkirim');
  return new URL(axios.getUri(sent), 'http://localhost');
}

describe('api.products', () => {
  it('memanggil /dashboard/products', async () => {
    const url = await requestUrl();
    expect(url.pathname.endsWith('/dashboard/products')).toBe(true);
  });

  it('tanpa filter: tidak ada query string', async () => {
    expect((await requestUrl({})).search).toBe('');
  });

  it('productLine dikirim sebagai key berulang (bukan productLine[]), urut abjad dan tanpa duplikat', async () => {
    const url = await requestUrl({ productLine: ['Ships', 'Classic Cars', 'Ships'], year: 2004 });
    expect(url.searchParams.getAll('productLine')).toEqual(['Classic Cars', 'Ships']);
    expect(url.searchParams.get('year')).toBe('2004');
    expect(url.search).not.toMatch(/%5B|\[/);
  });

  it('year dan month dikirim sebagai angka biasa', async () => {
    const url = await requestUrl({ year: 2003, month: 11 });
    expect(url.searchParams.get('year')).toBe('2003');
    expect(url.searchParams.get('month')).toBe('11');
  });

  it('parameter yang ditolak BE (strict, 422) dibuang', async () => {
    const filter = { year: 2004, continent: 'Europe', country: 'France', status: 'Shipped' } as ProductsFilter;
    const url = await requestUrl(filter);
    expect([...url.searchParams.keys()]).toEqual(['year']);
  });
});
