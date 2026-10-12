import { describe, expect, it } from 'vitest';
import { remapKeys } from './remapKeys';

const SPEARMEN_COUNT = 4;
const KNIGHTS_COUNT = 2;
const SPEARMEN_CODE = 7;

const CODE_BY_ID = new Map([['spearmen', SPEARMEN_CODE]]);
const lookupCode = (id: string) => CODE_BY_ID.get(id);

describe('remapKeys', () => {
  it('renames each key through the lookup, keeping its value', () => {
    expect(remapKeys({ spearmen: SPEARMEN_COUNT }, lookupCode)).toEqual({
      [SPEARMEN_CODE]: SPEARMEN_COUNT,
    });
  });

  it('drops entries whose key does not resolve', () => {
    const record = { spearmen: SPEARMEN_COUNT, knights: KNIGHTS_COUNT };

    expect(remapKeys(record, lookupCode)).toEqual({ [SPEARMEN_CODE]: SPEARMEN_COUNT });
  });

  it('returns an empty record when nothing resolves', () => {
    expect(remapKeys({ knights: KNIGHTS_COUNT }, lookupCode)).toEqual({});
  });
});
