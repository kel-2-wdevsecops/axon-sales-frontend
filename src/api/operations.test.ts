import axios, { type InternalAxiosRequestConfig } from 'axios';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { OperationsFilter } from '@/types';

// Memastikan bentuk permintaan ke BE tanpa jaringan (pola sama dengan products.test.ts):
// adapter axios dipasang sebelum client `http` dibuat, lalu URL yang sebenarnya
// dikirim dibaca dari konfigurasi akhir.

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

async function requestUrl(filter?: OperationsFilter): Promise<URL> {
  await api.operations(filter);
  if (!sent) throw new Error('permintaan tidak terkirim');
  return new URL(axios.getUri(sent), 'http://localhost');
}

describe('api.operations', () => {
  it('memanggil /dashboard/operations', async () => {
    const url = await requestUrl();
    expect(url.pathname.endsWith('/dashboard/operations')).toBe(true);
  });

  it('tanpa filter: tidak ada query string', async () => {
    expect((await requestUrl({})).search).toBe('');
  });

  it('year dan status dikirim apa adanya', async () => {
    const url = await requestUrl({ year: 2004, status: 'On Hold' });
    expect(url.searchParams.get('year')).toBe('2004');
    expect(url.searchParams.get('status')).toBe('On Hold');
  });

  it('parameter yang ditolak BE (strict, 422) dibuang', async () => {
    const filter = { year: 2004, month: 5, continent: 'Europe', country: 'France', productLine: ['Ships'] } as OperationsFilter;
    const url = await requestUrl(filter);
    expect([...url.searchParams.keys()]).toEqual(['year']);
  });
});
