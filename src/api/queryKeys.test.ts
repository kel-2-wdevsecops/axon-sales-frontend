import { describe, expect, it } from 'vitest';
import { queryKeys } from './queryKeys';
import type { OperationsFilter } from '@/types';

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

describe('queryKeys.operations', () => {
  it('parameter yang tidak diterima BE tidak ikut key (dua filter setara memakai key yang sama)', () => {
    const a = queryKeys.operations({ year: 2004, status: 'On Hold' });
    const noisy = { status: 'On Hold', year: 2004, month: 5, country: 'USA' } as OperationsFilter;
    expect(queryKeys.operations(noisy)).toEqual(a);
  });

  it('filter berbeda memakai key berbeda, termasuk dibanding halaman lain', () => {
    expect(queryKeys.operations({ year: 2003 })).not.toEqual(queryKeys.operations({ year: 2004 }));
    expect(queryKeys.operations({ status: 'Shipped' })).not.toEqual(queryKeys.operations({}));
    expect(queryKeys.operations({})).not.toEqual(queryKeys.growth({}));
  });
});
