import { describe, expect, it } from 'vitest';
import type { FilterOptions } from '@/types';
import { carryFilterSearch, normalizeFilter, PAGE_FILTER_KEYS, parseFilter, serializeFilter } from './filters';

const q = (query: string) => new URLSearchParams(query);

const options: FilterOptions = {
  dataRange: { from: '2003-01-06', to: '2005-05-31' },
  years: [2003, 2004, 2005],
  continents: ['Africa', 'Asia', 'Europe', 'North America', 'Oceania'],
  countries: [
    { country: 'Australia', continent: 'Oceania' },
    { country: 'France', continent: 'Europe' },
    { country: 'New Zealand', continent: 'Oceania' },
    { country: 'USA', continent: 'North America' },
  ],
  productLines: ['Classic Cars', 'Motorcycles', 'Ships', 'Trains'],
  statuses: ['Cancelled', 'Shipped'],
};

describe('parseFilter', () => {
  it('membaca semua parameter yang valid', () => {
    expect(
      parseFilter(q('year=2004&month=3&continent=Europe&country=France&productLine=Ships&status=Shipped')),
    ).toEqual({
      year: 2004,
      month: 3,
      continent: 'Europe',
      country: 'France',
      productLine: ['Ships'],
      status: 'Shipped',
    });
  });

  it('query kosong -> filter kosong', () => {
    expect(parseFilter(q(''))).toEqual({});
  });

  it('nilai asing dibuang tanpa melempar error', () => {
    expect(parseFilter(q('year=abc&month=13&country=Atlantis!&continent=<script>'))).toEqual({});
    expect(parseFilter(q('year=1999'))).toEqual({});
    expect(parseFilter(q('year=2004abc'))).toEqual({});
    expect(parseFilter(q('year=-2004'))).toEqual({});
    expect(parseFilter(q('month=0'))).toEqual({});
  });

  it('nilai kosong dibuang', () => {
    expect(parseFilter(q('year=&month=&country=&productLine=&status='))).toEqual({});
  });

  it('parameter yang tidak dikenal diabaikan', () => {
    expect(parseFilter(q('year=2004&utm_source=x&page=2'))).toEqual({ year: 2004 });
  });

  it('productLine berulang: di-dedup dan diurutkan', () => {
    expect(parseFilter(q('productLine=Ships&productLine=Classic%20Cars&productLine=Ships'))).toEqual({
      productLine: ['Classic Cars', 'Ships'],
    });
  });

  it('productLine dengan karakter di luar aturan BE dibuang, maksimal 7', () => {
    expect(parseFilter(q('productLine=Ships&productLine=Ships;DROP'))).toEqual({ productLine: ['Ships'] });
    const eight = 'ABCDEFGH'.split('').map((c) => `productLine=Line%20${c}`).join('&');
    expect(parseFilter(q(eight)).productLine).toHaveLength(7);
  });

  it('nilai berulang selain productLine memakai kemunculan pertama', () => {
    expect(parseFilter(q('year=2003&year=2004'))).toEqual({ year: 2003 });
  });

  it('parameter yang tidak berlaku di halaman dibuang', () => {
    const scope = { keys: PAGE_FILTER_KEYS.growth };
    expect(parseFilter(q('year=2004&country=USA&month=2&productLine=Ships'), scope)).toEqual({ year: 2004 });
  });

  describe('dengan daftar pilihan dari /dashboard/filters', () => {
    it('nilai di luar daftar dibuang', () => {
      expect(parseFilter(q('year=2010&continent=Atlantis&country=Narnia&status=Lost&productLine=Boats'), { options })).toEqual({});
    });

    it('nilai di dalam daftar dipertahankan', () => {
      expect(parseFilter(q('year=2005&country=USA&productLine=Trains&status=Cancelled'), { options })).toEqual({
        year: 2005,
        country: 'USA',
        productLine: ['Trains'],
        status: 'Cancelled',
      });
    });

    it('negara yang bukan bagian benua terpilih dibuang, benua dipertahankan', () => {
      expect(parseFilter(q('continent=Oceania&country=USA'), { options })).toEqual({ continent: 'Oceania' });
      expect(parseFilter(q('continent=Oceania&country=Australia'), { options })).toEqual({
        continent: 'Oceania',
        country: 'Australia',
      });
    });

    it('negara tanpa benua tetap valid bila ada di daftar', () => {
      expect(parseFilter(q('country=France'), { options })).toEqual({ country: 'France' });
    });

    it('negara tidak dibandingkan dengan benua bila benua tidak berlaku di halaman', () => {
      const scope = { options, keys: ['country'] as const };
      expect(parseFilter(q('continent=Oceania&country=USA'), scope)).toEqual({ country: 'USA' });
    });
  });
});

describe('serializeFilter', () => {
  it('urutan parameter kanonik, productLine sebagai key berulang', () => {
    const params = serializeFilter({
      status: 'Shipped',
      productLine: ['Ships', 'Classic Cars'],
      country: 'France',
      year: 2004,
      month: 3,
      continent: 'Europe',
    });
    expect(params.toString()).toBe(
      'year=2004&month=3&continent=Europe&country=France&productLine=Classic+Cars&productLine=Ships&status=Shipped',
    );
    expect(params.getAll('productLine')).toEqual(['Classic Cars', 'Ships']);
  });

  it('nilai kosong tidak ditulis', () => {
    expect(serializeFilter({}).toString()).toBe('');
    expect(serializeFilter({ year: undefined, productLine: [], country: '', continent: '  ' }).toString()).toBe('');
  });

  it('nilai asing dibuang saat serialisasi', () => {
    expect(serializeFilter({ year: 1990, month: 13, country: 'a/b' }).toString()).toBe('');
  });

  it('hanya parameter yang berlaku di halaman', () => {
    const filter = { year: 2004, country: 'USA', productLine: ['Ships'] };
    expect(serializeFilter(filter, { keys: PAGE_FILTER_KEYS.growth }).toString()).toBe('year=2004');
  });

  it('parse(serialize(x)) mengembalikan filter yang sama', () => {
    const filter = { year: 2004, month: 11, continent: 'Europe', country: 'France', productLine: ['Classic Cars', 'Ships'], status: 'In Process' };
    expect(parseFilter(serializeFilter(filter))).toEqual(filter);
  });

  it('serialize(parse(url)) menormalisasi urutan dan duplikat', () => {
    const url = q('productLine=Ships&productLine=Classic%20Cars&year=2004&productLine=Ships&junk=1');
    expect(serializeFilter(parseFilter(url)).toString()).toBe('year=2004&productLine=Classic+Cars&productLine=Ships');
  });
});

describe('normalizeFilter', () => {
  it('urutan key hasil selalu kanonik (untuk key cache)', () => {
    const a = normalizeFilter({ country: 'USA', year: 2004 });
    const b = normalizeFilter({ year: 2004, country: 'USA' });
    expect(Object.keys(a)).toEqual(['year', 'country']);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('tidak mengubah objek masukan', () => {
    const productLine = ['Ships', 'Classic Cars'];
    normalizeFilter({ productLine });
    expect(productLine).toEqual(['Ships', 'Classic Cars']);
  });

  it('parameter yang diterima BE per halaman sesuai DTO BE', () => {
    expect(PAGE_FILTER_KEYS.overview).toEqual(['year', 'month', 'continent', 'country']);
    expect(PAGE_FILTER_KEYS.products).toEqual(['year', 'month', 'productLine']);
    expect(PAGE_FILTER_KEYS.growth).toEqual(['year']);
    expect(PAGE_FILTER_KEYS.customers).toEqual(['year', 'continent', 'country']);
    expect(PAGE_FILTER_KEYS.operations).toEqual(['year', 'status']);
  });
});

describe('carryFilterSearch', () => {
  it('hanya membawa parameter yang berlaku di halaman tujuan', () => {
    expect(carryFilterSearch('?year=2004&country=USA', 'growth')).toBe('?year=2004');
    expect(carryFilterSearch('?year=2004&month=3&productLine=Ships&status=Shipped', 'products')).toBe(
      '?year=2004&month=3&productLine=Ships',
    );
    expect(carryFilterSearch('year=2004&continent=Europe&country=France&status=Shipped', 'customers')).toBe(
      '?year=2004&continent=Europe&country=France',
    );
  });

  it('tanpa parameter yang berlaku -> string kosong', () => {
    expect(carryFilterSearch('?country=USA', 'growth')).toBe('');
    expect(carryFilterSearch('', 'overview')).toBe('');
  });

  it('nilai tidak valid dan parameter asing tidak ikut terbawa', () => {
    expect(carryFilterSearch('?year=abc&utm_source=x&month=2', 'overview')).toBe('?month=2');
  });

  it('urutan productLine dinormalisasi', () => {
    expect(carryFilterSearch('?productLine=Ships&productLine=Classic%20Cars', 'products')).toBe(
      '?productLine=Classic+Cars&productLine=Ships',
    );
  });
});
