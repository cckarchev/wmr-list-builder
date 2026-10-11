import { describe, expect, it } from 'vitest';
import type { Unit, UpgradeConstraint } from '@/data/types';
import { constraintApplies, minMax, resolveUpgradePoints } from './storeHelpers';

describe('resolveUpgradePoints', () => {
  it('returns a flat scalar price for fixed-price upgrades', () => {
    const points = 25;
    expect(resolveUpgradePoints({ points })).toBe(points);
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

const POINTS = 45;
const THREE_HITS = 3;

const KNIGHTS: Unit = { id: 1, type: 'Cavalry', armour: '4+', hits: THREE_HITS, points: POINTS };

const CAVALRY_BANNERS: UpgradeConstraint = { unitType: ['Cavalry'], upgrades: ['Banner'] };

describe('constraintApplies', () => {
  it('applies when the unit type matches and nothing else is restricted', () => {
    expect(constraintApplies(KNIGHTS, CAVALRY_BANNERS)).toBe(true);
  });

  it('does not apply to other unit types', () => {
    const infantry: Unit = { ...KNIGHTS, type: 'Infantry' };

    expect(constraintApplies(infantry, CAVALRY_BANNERS)).toBe(false);
  });

  it('checks armour, reading a missing armour as "-"', () => {
    const unarmouredOnly = { ...CAVALRY_BANNERS, unitArmour: ['-'] };
    const unarmoured: Unit = { ...KNIGHTS, armour: undefined };

    expect(constraintApplies(KNIGHTS, unarmouredOnly)).toBe(false);
    expect(constraintApplies(unarmoured, unarmouredOnly)).toBe(true);
  });

  it('checks hits, reading missing hits as "-"', () => {
    const threeHitsOnly = { ...CAVALRY_BANNERS, unitHits: [THREE_HITS] };
    const noHits: Unit = { ...KNIGHTS, hits: undefined };

    expect(constraintApplies(KNIGHTS, threeHitsOnly)).toBe(true);
    expect(constraintApplies(noHits, threeHitsOnly)).toBe(false);
    expect(constraintApplies(noHits, { ...CAVALRY_BANNERS, unitHits: ['-'] })).toBe(true);
  });

  it('never applies to a unit flagged noUpgrades', () => {
    const plain = { ...KNIGHTS, noUpgrades: true } as Unit;

    expect(constraintApplies(plain, CAVALRY_BANNERS)).toBe(false);
  });

  it('skips magic constraints for a unit flagged noMagic', () => {
    const magicBanners = { ...CAVALRY_BANNERS, magic: true };
    const mundane: Unit = { ...KNIGHTS, noMagic: true };

    expect(constraintApplies(mundane, magicBanners)).toBe(false);
    expect(constraintApplies(mundane, CAVALRY_BANNERS)).toBe(true);
  });
});

describe('minMax', () => {
  const ARMY_MIN = 1;
  const ARMY_MAX = 3;
  const RATE_MIN = 1;
  const RATE_MAX = 6;
  const troop = (limits: Partial<Unit>): Unit => ({ ...KNIGHTS, ...limits });

  it('prints an absolute army range', () => {
    expect(minMax(troop({ armyMin: ARMY_MIN, armyMax: ARMY_MAX }))).toBe(`${ARMY_MIN}–${ARMY_MAX}`);
  });

  it('prints a single number when the army min and max match or there is no max', () => {
    expect(minMax(troop({ armyMin: ARMY_MAX, armyMax: ARMY_MAX }))).toBe(String(ARMY_MAX));
    expect(minMax(troop({ armyMin: ARMY_MIN }))).toBe(String(ARMY_MIN));
  });

  it('starts an army max-only range at zero', () => {
    expect(minMax(troop({ armyMax: ARMY_MAX }))).toBe(`0–${ARMY_MAX}`);
  });

  it('prints a keyword token as is', () => {
    expect(minMax(troop({ min: 'All or None' }))).toBe('All or None');
    expect(minMax(troop({ max: 'elite' }))).toBe('elite');
  });

  it('prints the per-1,000-points rate, with "-" for a missing bound', () => {
    expect(minMax(troop({ min: RATE_MIN, max: RATE_MAX }))).toBe(`${RATE_MIN}/${RATE_MAX}`);
    expect(minMax(troop({ min: RATE_MIN }))).toBe(`${RATE_MIN}/-`);
    expect(minMax(troop({}))).toBe('-/-');
  });
});
