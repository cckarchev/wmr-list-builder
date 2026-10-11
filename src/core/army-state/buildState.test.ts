import { describe, expect, it } from 'vitest';
import type { Unit, UpgradeConstraint } from '@/data/types';
import { constraintApplies } from './buildState';

const POINTS = 45;
const THREE_HITS = 3;

const KNIGHTS: Unit = {
  id: 'knights',
  name: 'Knights',
  code: 1,
  type: 'Cavalry',
  armour: '4+',
  hits: THREE_HITS,
  points: POINTS,
};

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
