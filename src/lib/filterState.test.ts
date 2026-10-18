import { describe, expect, it } from 'vitest';
import type { FilterOptions } from '@/types';
import { PAGE_FILTER_KEYS } from './filters';
import {
  activeChips,
  applyFilterChange,
  buildShareUrl,
  countryChoices,
  nextSearchParams,
  summarizeFilter,
  toggleValue,
} from './filterState';

const options: FilterOptions = {
  dataRange: { from: '2003-01-06', to: '2005-05-31' },
  years: [2003, 2004, 2005],
  continents: ['Europe', 'North America', 'Oceania'],
  countries: [
    { country: 'New Zealand', continent: 'Oceania' },
    { country: 'Australia', continent: 'Oceania' },
    { country: 'France', continent: 'Europe' },
    { country: 'USA', continent: 'North America' },
  ],
  productLines: ['Classic Cars', 'Motorcycles', 'Ships'],
  statuses: ['Cancelled', 'Shipped'],
};

const overview = { keys: PAGE_FILTER_KEYS.overview, options };
const q = (query: string) => new URLSearchParams(query);

describe('countryChoices', () => {
  it('tanpa benua: semua negara, urut abjad', () => {
    expect(countryChoices(options)).toEqual(['Australia', 'France', 'New Zealand', 'USA']);
  });

  it('menyempit menurut benua (Oceania -> Australia dan New Zealand)', () => {
    expect(countryChoices(options, 'Oceania')).toEqual(['Australia', 'New Zealand']);
    expect(countryChoices(options, 'Europe')).toEqual(['France']);
  });

  it('benua tanpa negara -> kosong', () => {
    expect(countryChoices(options, 'Africa')).toEqual([]);
  });
});

describe('applyFilterChange', () => {
  it('menetapkan nilai baru dan mempertahankan yang lain', () => {
    expect(applyFilterChange({ year: 2004 }, { country: 'USA' }, overview)).toEqual({ year: 2004, country: 'USA' });
  });

  it('null menghapus satu parameter, undefined membiarkannya', () => {
    expect(applyFilterChange({ year: 2004, month: 3 }, { month: null, year: undefined }, overview)).toEqual({ year: 2004 });
  });

  it('mengganti benua membuang negara yang bukan bagiannya', () => {
    expect(applyFilterChange({ continent: 'Europe', country: 'France' }, { continent: 'Oceania' }, overview)).toEqual({
      continent: 'Oceania',
    });
  });

  it('mengganti benua mempertahankan negara yang masih bagiannya', () => {
    expect(applyFilterChange({ country: 'Australia' }, { continent: 'Oceania' }, overview)).toEqual({
      continent: 'Oceania',
      country: 'Australia',
    });
  });

  it('menghapus benua tidak menghapus negara', () => {
    expect(applyFilterChange({ continent: 'Oceania', country: 'Australia' }, { continent: null }, overview)).toEqual({
      country: 'Australia',
    });
  });

  it('nilai di luar daftar atau di luar halaman dibuang', () => {
    expect(applyFilterChange({}, { year: 2010, status: 'Shipped' }, overview)).toEqual({});
  });

  it('productLine kosong menghapus parameter, urutan dinormalisasi', () => {
    const scope = { keys: PAGE_FILTER_KEYS.products, options };
    expect(applyFilterChange({ productLine: ['Ships'] }, { productLine: [] }, scope)).toEqual({});
    expect(applyFilterChange({}, { productLine: ['Ships', 'Classic Cars'] }, scope)).toEqual({
      productLine: ['Classic Cars', 'Ships'],
    });
  });

  it('tidak mengubah objek masukan', () => {
    const current = { year: 2004 };
    applyFilterChange(current, { year: null }, overview);
    expect(current).toEqual({ year: 2004 });
  });
});

describe('nextSearchParams', () => {
  it('menulis filter kanonik dari URL + perubahan', () => {
    const next = nextSearchParams(q('country=Australia&year=2004'), { month: 3 }, overview);
    expect(next.toString()).toBe('year=2004&month=3&country=Australia');
  });

  it('change kosong membersihkan URL: nilai rusak dan tak berlaku dibuang', () => {
    expect(nextSearchParams(q('year=abc&country=Atlantis&month=2&status=Shipped'), {}, overview).toString()).toBe('month=2');
  });

  it('mengganti benua di URL membuang negara yang tidak cocok', () => {
    expect(nextSearchParams(q('continent=Europe&country=France'), { continent: 'Oceania' }, overview).toString()).toBe(
      'continent=Oceania',
    );
  });

  it('parameter di luar filter dibiarkan', () => {
    const next = nextSearchParams(q('tab=ringkas&year=2004'), { year: 2005 }, overview);
    expect(next.get('tab')).toBe('ringkas');
    expect(next.get('year')).toBe('2005');
  });

  it('URL sudah bersih -> hasil identik (tanpa replace berulang)', () => {
    const clean = 'year=2004&country=USA';
    expect(nextSearchParams(q(clean), {}, overview).toString()).toBe(clean);
  });

  it('mengurutkan dan men-dedup productLine di URL', () => {
    const scope = { keys: PAGE_FILTER_KEYS.products, options };
    const next = nextSearchParams(q('productLine=Ships&productLine=Classic%20Cars&year=2004&productLine=Ships'), {}, scope);
    expect(next.toString()).toBe('year=2004&productLine=Classic+Cars&productLine=Ships');
  });

  it('reset: semua kunci halaman null menyisakan hanya parameter asing', () => {
    const reset = Object.fromEntries(PAGE_FILTER_KEYS.overview.map((key) => [key, null]));
    expect(nextSearchParams(q('year=2004&country=USA&tab=x'), reset, overview).toString()).toBe('tab=x');
    expect(nextSearchParams(q('year=2004&month=3&country=USA'), reset, overview).toString()).toBe('');
  });
});

describe('buildShareUrl', () => {
  it('base + query kanonik', () => {
    expect(buildShareUrl('https://axon.test/', { country: 'USA', year: 2004 })).toBe('https://axon.test/?year=2004&country=USA');
  });

  it('tanpa filter -> base saja', () => {
    expect(buildShareUrl('https://axon.test/produk', {})).toBe('https://axon.test/produk');
  });

  it('parameter yang tak berlaku di halaman tidak ikut dibagikan', () => {
    const url = buildShareUrl('https://axon.test/pertumbuhan', { year: 2004, country: 'USA' }, { keys: PAGE_FILTER_KEYS.growth });
    expect(url).toBe('https://axon.test/pertumbuhan?year=2004');
  });
});

describe('toggleValue', () => {
  it('menambah dan membuang nilai tanpa mengubah masukan', () => {
    const list = ['Ships'];
    expect(toggleValue(list, 'Trains')).toEqual(['Ships', 'Trains']);
    expect(toggleValue(list, 'Ships')).toEqual([]);
    expect(toggleValue(undefined, 'Ships')).toEqual(['Ships']);
    expect(list).toEqual(['Ships']);
  });
});

describe('activeChips', () => {
  it('filter kosong -> tanpa chip', () => {
    expect(activeChips({})).toEqual([]);
  });

  it('label dan aria-label sesuai dokumen F06', () => {
    const [chip] = activeChips({ year: 2004 });
    expect(chip?.label).toBe('Tahun 2004');
    expect(chip?.ariaLabel).toBe('Hapus filter Tahun 2004');
    expect(chip?.change).toEqual({ year: null });
  });

  it('nama bulan Indonesia dan urutan kanonik', () => {
    const chips = activeChips({ status: 'Shipped', month: 3, year: 2004, country: 'USA', continent: 'North America' });
    expect(chips.map((c) => c.label)).toEqual(['Tahun 2004', 'Bulan Maret', 'Benua North America', 'Negara USA', 'Status Shipped']);
  });

  it('product line: satu chip per nilai, menghapusnya menyisakan yang lain', () => {
    const chips = activeChips({ productLine: ['Classic Cars', 'Ships'] });
    expect(chips.map((c) => c.id)).toEqual(['productLine:Classic Cars', 'productLine:Ships']);
    expect(chips[0]?.change).toEqual({ productLine: ['Ships'] });
    expect(chips[1]?.change).toEqual({ productLine: ['Classic Cars'] });
  });

  it('menerapkan change chip menghapus filternya', () => {
    const filter = { year: 2004, productLine: ['Classic Cars', 'Ships'] };
    const scope = { keys: PAGE_FILTER_KEYS.products, options };
    const chips = activeChips(filter);
    expect(applyFilterChange(filter, chips[0]!.change, scope)).toEqual({ productLine: ['Classic Cars', 'Ships'] });
    expect(applyFilterChange(filter, chips[1]!.change, scope)).toEqual({ year: 2004, productLine: ['Ships'] });
  });
});

describe('summarizeFilter', () => {
  it('tanpa filter', () => {
    expect(summarizeFilter({})).toBe('Menampilkan semua data.');
  });

  it('contoh dari dokumen F06', () => {
    expect(summarizeFilter({ year: 2004 })).toBe('Menampilkan data tahun 2004.');
  });

  it('gabungan filter', () => {
    expect(summarizeFilter({ year: 2004, month: 3, continent: 'Europe', country: 'France', productLine: ['Ships', 'Trains'], status: 'Shipped' })).toBe(
      'Menampilkan data tahun 2004, bulan Maret, benua Europe, negara France, product line Ships, Trains, status Shipped.',
    );
  });

  it('bulan tanpa tahun berarti semua tahun', () => {
    expect(summarizeFilter({ month: 12 })).toBe('Menampilkan data bulan Desember di semua tahun.');
  });
});
