import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { CustomersFilter } from '@/types';

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

async function requestUrl(filter?: CustomersFilter): Promise<URL> {
  await api.customers(filter);
  if (!sent) throw new Error('permintaan tidak terkirim');
  return new URL(axios.getUri(sent), 'http://localhost');
}

describe('api.customers', () => {
  it('memanggil /dashboard/customers', async () => {
    const url = await requestUrl();
    expect(url.pathname.endsWith('/dashboard/customers')).toBe(true);
  });

  it('tanpa filter: tidak ada query string', async () => {
    expect((await requestUrl({})).search).toBe('');
  });

  it('year, continent, dan country dikirim', async () => {
    const url = await requestUrl({ year: 2004, continent: 'Europe', country: 'France' });
    expect(url.searchParams.get('year')).toBe('2004');
    expect(url.searchParams.get('continent')).toBe('Europe');
    expect(url.searchParams.get('country')).toBe('France');
  });

  it('parameter yang ditolak BE (strict, 422) dibuang', async () => {
    const filter = { year: 2004, month: 5, productLine: ['Ships'], status: 'Shipped', country: 'USA' } as CustomersFilter;
    const url = await requestUrl(filter);
    expect([...url.searchParams.keys()]).toEqual(['year', 'country']);
  });
});
