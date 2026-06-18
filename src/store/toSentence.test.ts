import { describe, it, expect } from 'vitest';
import { toSentence } from './toSentence';

describe('toSentence', () => {
  it('joins three items with commas and a final connector', () => {
    expect(toSentence(['A', 'B', 'C'])).toBe('A, B or C');
  });

  it('returns a single item unchanged', () => {
    expect(toSentence(['A'])).toBe('A');
  });

  it('joins two items with only the last connector', () => {
    expect(toSentence(['A', 'B'])).toBe('A or B');
  });

  it('honours custom connectors', () => {
    expect(toSentence(['A', 'B', 'C'], '; ', ' and ')).toBe('A; B and C');
  });
});
