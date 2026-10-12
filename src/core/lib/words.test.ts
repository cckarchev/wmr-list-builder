import { describe, expect, it } from 'vitest';
import { words } from './words';

describe('words', () => {
  it('splits text on any run of whitespace', () => {
    expect(words('Dogs  of\tWar')).toEqual(['Dogs', 'of', 'War']);
  });

  it('ignores leading and trailing whitespace', () => {
    expect(words('  High Elves ')).toEqual(['High', 'Elves']);
  });

  it('finds no words in blank text', () => {
    expect(words('   ')).toEqual([]);
  });
});
