import { describe, expect, it } from 'vitest';
import { queryKeys } from './queryKeys';

describe('queryKeys.products', () => {
  it('dua filter yang setara memakai key yang sama (urutan product line, duplikat, parameter asing)', () => {
    const a = queryKeys.products({ productLine: ['Ships', 'Classic Cars'], year: 2004 });
    const b = queryKeys.products({ year: 2004, productLine: ['Classic Cars', 'Ships', 'Ships'] });
    expect(a).toEqual(b);
  });

  it('filter berbeda memakai key berbeda', () => {
    expect(queryKeys.products({ year: 2003 })).not.toEqual(queryKeys.products({ year: 2004 }));
    expect(queryKeys.products({})).not.toEqual(queryKeys.overview({}));
  });
});

describe('queryKeys.customers', () => {
  it('parameter yang tidak berlaku di halaman (bulan, product line, status) tidak memecah cache', () => {
    const a = queryKeys.customers({ year: 2004, country: 'France' });
    const b = queryKeys.customers({ country: 'France', year: 2004, month: 5, productLine: ['Ships'], status: 'Shipped' } as never);
    expect(a).toEqual(b);
  });

  it('filter berbeda atau halaman berbeda memakai key berbeda', () => {
    expect(queryKeys.customers({ year: 2003 })).not.toEqual(queryKeys.customers({ year: 2004 }));
    expect(queryKeys.customers({})).not.toEqual(queryKeys.growth({}));
  });
});
