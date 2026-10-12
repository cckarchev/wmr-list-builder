import { describe, expect, it } from 'vitest';
import { formatStat, MISSING_STAT } from './formatStat';

const ATTACK = 3;

describe('formatStat', () => {
  it('shows numbers and text as they are', () => {
    expect(formatStat(ATTACK)).toBe(String(ATTACK));
    expect(formatStat('30cm')).toBe('30cm');
  });

  it('shows a placeholder for a missing or empty stat', () => {
    expect(formatStat(undefined)).toBe(MISSING_STAT);
    expect(formatStat('')).toBe(MISSING_STAT);
  });
});
