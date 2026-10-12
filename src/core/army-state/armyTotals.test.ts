import { beforeEach, describe, expect, it } from 'vitest';
import { useArmyStore } from '@/store/useArmyStore';
import { breakPoint, pointsCost, unitCount } from './armyTotals';
import type { UnitState } from './types';

const ADDED_HALBERDIERS = 3;
/** An odd count, so the break point has to round up. */
const GOBLIN_STANDS = 5;
const SPEARMEN_STANDS = 4;
const SCOUT_STANDS = 2;

const get = () => useArmyStore.getState();

beforeEach(() => {
  get().reset();
});

describe('pointsCost', () => {
  it('sums unit pointsCost across the army', () => {
    get().setArmy('goblin');
    get().setUnitNumber('goblins', 10);
    // The selector sums every unit's cost, including auto-included minimums.
    const total = Object.values(get().units).reduce((sum, u) => sum + u.pointsCost, 0);

    expect(pointsCost(get())).toBe(total);
  });
});

describe('unitCount', () => {
  it('excludes noCount units', () => {
    get().setArmy('empire');
    const before = unitCount(get().units);
    // Adding a noCount unit (Skirmishers) does not change the count.
    get().setUnitNumber('skirmishers', get().units.skirmishers.number + 2);

    expect(unitCount(get().units)).toBe(before);

    // Adding a counted unit does.
    get().setUnitNumber('halberdiers', get().units.halberdiers.number + ADDED_HALBERDIERS);

    expect(unitCount(get().units)).toBe(before + ADDED_HALBERDIERS);
  });

  it('sums every countable unit, whatever its special rules', () => {
    const units = {
      spearmen: { type: 'Infantry', number: SPEARMEN_STANDS } as UnitState,
      scouts: {
        type: 'Infantry',
        number: SCOUT_STANDS,
        specialRules: ['skirmish'],
      } as UnitState,
      general: { type: 'General', number: 1 } as UnitState,
      skirmishers: { type: 'Infantry', number: 1, noCount: true } as UnitState,
    };

    expect(unitCount(units)).toBe(SPEARMEN_STANDS + SCOUT_STANDS);
  });
});

describe('breakPoint', () => {
  it('is 0 for an empty army', () => {
    expect(breakPoint({})).toBe(0);
  });

  it('is half the counted units, rounded up', () => {
    get().setArmy('goblin');
    get().setUnitNumber('goblins', GOBLIN_STANDS); // counted units
    const count = unitCount(get().units);

    expect(breakPoint(get().units)).toBe(Math.ceil(count / 2));
  });

  it('tracks unitCount (ignores noCount units)', () => {
    get().setArmy('empire');
    const before = breakPoint(get().units);
    get().setUnitNumber('skirmishers', get().units.skirmishers.number + 2); // noCount
    expect(breakPoint(get().units)).toBe(before);
  });
});
