import { describe, expect, it } from 'vitest';
import { specialRuleMarkers } from './specialRuleMarkers';

const RULES = {
  Knights: { order: 3 },
  Fear: { order: 1 },
  Fly: {},
};

describe('specialRuleMarkers', () => {
  it('returns an empty string when no name has a numbered rule', () => {
    expect(specialRuleMarkers(['Spearmen', 'Fly'], RULES)).toBe('');
  });

  it('marks each numbered rule with an asterisk', () => {
    expect(specialRuleMarkers(['Knights'], RULES)).toBe('*3');
  });

  it('sorts the markers by their rule number', () => {
    expect(specialRuleMarkers(['Knights', 'Fly', 'Fear'], RULES)).toBe('*1, *3');
  });
});
