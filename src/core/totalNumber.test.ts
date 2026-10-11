import { describe, expect, it } from 'vitest';
import { totalNumber } from './totalNumber';

const SPEARMEN = 4;
const ARCHERS = 2;

const POOL = { Spearmen: { number: SPEARMEN }, Archers: { number: ARCHERS } };

describe('totalNumber', () => {
  it('adds up the number taken of each listed id', () => {
    expect(totalNumber(['Spearmen', 'Archers'], POOL)).toBe(SPEARMEN + ARCHERS);
  });

  it('only counts the listed ids', () => {
    expect(totalNumber(['Archers'], POOL)).toBe(ARCHERS);
  });

  it('is zero for no ids', () => {
    expect(totalNumber([], POOL)).toBe(0);
  });
});
