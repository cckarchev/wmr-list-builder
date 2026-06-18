import { describe, it, expect } from 'vitest';
import { resolveUpgradePoints } from './storeHelpers';

describe('resolveUpgradePoints', () => {
  it('returns a flat scalar price for fixed-price upgrades', () => {
    expect(resolveUpgradePoints({ points: 25 })).toBe(25);
    expect(resolveUpgradePoints({ points: '15' })).toBe('15');
  });

  it('returns undefined for a fixed-price upgrade with no price', () => {
    expect(resolveUpgradePoints({})).toBeUndefined();
  });

  it('looks up the price by the unit stat named in pointsValue', () => {
    const upgrade = { pointsValue: 'size', points: { '3': '30', '4': '40' } };
    expect(resolveUpgradePoints(upgrade, { size: 3 })).toBe('30');
    expect(resolveUpgradePoints(upgrade, { size: 4 })).toBe('40');
  });

  it('returns undefined when the unit stat has no matching price entry', () => {
    const upgrade = { pointsValue: 'size', points: { '3': '30' } };
    expect(resolveUpgradePoints(upgrade, { size: 9 })).toBeUndefined();
  });

  it('returns undefined for a variable-price upgrade with no unit context', () => {
    const upgrade = { pointsValue: 'size', points: { '3': '30' } };
    expect(resolveUpgradePoints(upgrade)).toBeUndefined();
  });
});
