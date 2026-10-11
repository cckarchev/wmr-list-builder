import { describe, expect, it } from 'vitest';
import { remapKeys } from './remapKeys';

const SPEARMEN_COUNT = 4;
const KNIGHTS_COUNT = 2;
const SPEARMEN_ID = 7;

const ID_BY_NAME = new Map([['Spearmen', SPEARMEN_ID]]);
const lookupId = (name: string) => ID_BY_NAME.get(name);

describe('remapKeys', () => {
  it('renames each key through the lookup, keeping its value', () => {
    expect(remapKeys({ Spearmen: SPEARMEN_COUNT }, lookupId)).toEqual({
      [SPEARMEN_ID]: SPEARMEN_COUNT,
    });
  });

  it('drops entries whose key does not resolve', () => {
    const record = { Spearmen: SPEARMEN_COUNT, Knights: KNIGHTS_COUNT };

    expect(remapKeys(record, lookupId)).toEqual({ [SPEARMEN_ID]: SPEARMEN_COUNT });
  });

  it('returns an empty record when nothing resolves', () => {
    expect(remapKeys({ Knights: KNIGHTS_COUNT }, lookupId)).toEqual({});
  });
});
