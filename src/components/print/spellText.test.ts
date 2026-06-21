import { describe, it, expect } from 'vitest';
import { stripSpellFlavor } from './spellText';

describe('stripSpellFlavor', () => {
  it('strips a leading italic flavor line and the following blank line', () => {
    expect(stripSpellFlavor(['*An eerie mist rises.*', '', 'This spell can be cast.'])).toEqual([
      'This spell can be cast.',
    ]);
  });

  it('strips the flavor line even with no following blank line', () => {
    expect(stripSpellFlavor(['*Flavor.*', 'A rule.'])).toEqual(['A rule.']);
  });

  it('leaves text without a flavor line unchanged', () => {
    expect(stripSpellFlavor(['A rule.', 'Another rule.'])).toEqual(['A rule.', 'Another rule.']);
  });

  it('returns an empty array unchanged', () => {
    expect(stripSpellFlavor([])).toEqual([]);
  });
});
