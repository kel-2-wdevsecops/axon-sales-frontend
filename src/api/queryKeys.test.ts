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
