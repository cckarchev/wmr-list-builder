import { describe, expect, it } from 'vitest';
import { initials } from './initials';

describe('initials', () => {
  it('takes the first letter of each word', () => {
    expect(initials('Dark Elves')).toBe('DE');
  });

  it('skips lowercase joining words', () => {
    expect(initials('Dogs of War')).toBe('DW');
  });

  it('keeps at most two letters', () => {
    expect(initials('Very Long Army Name')).toBe('VL');
  });

  it('uses the single letter of a one-word name', () => {
    expect(initials('Empire')).toBe('E');
  });

  it('returns an empty string for a blank name', () => {
    expect(initials('  ')).toBe('');
  });
});
