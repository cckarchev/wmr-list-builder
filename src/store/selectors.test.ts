import { describe, it, expect, beforeEach } from 'vitest';
import { useArmyStore } from './useArmyStore';
import {
  pointsCost,
  armySize,
  unitCount,
  usedUnits,
  usedUpgrades,
  errorsForTarget,
  globalErrors,
} from './selectors';
import type { ValidationError } from '../data/types';

const get = () => useArmyStore.getState();

beforeEach(() => {
  get().reset();
});

describe('armySize', () => {
  it('is at least 1', () => {
    expect(armySize(0)).toBe(1);
    expect(armySize(999)).toBe(1);
  });
  it('grows per 1000 points', () => {
    expect(armySize(2500)).toBe(2);
    expect(armySize(3000)).toBe(3);
  });
});

describe('pointsCost', () => {
  it('sums unit pointsCost across the army', () => {
    get().setArmy('goblin');
    get().setUnitNumber('Goblins', 10);
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
    get().setUnitNumber('Skirmishers', get().units.Skirmishers.number + 2);
    expect(unitCount(get().units)).toBe(before);
    // Adding a counted unit does.
    get().setUnitNumber('Halberdiers', get().units.Halberdiers.number + 3);
    expect(unitCount(get().units)).toBe(before + 3);
  });
});

describe('errorsForTarget / globalErrors', () => {
  const errors: ValidationError[] = [
    { message: 'over cap', targets: [] },
    { message: 'too few A', targets: ['A'] },
    { message: 'A or B issue', targets: ['A', 'B'] },
  ];

  it('errorsForTarget returns every error naming the id', () => {
    expect(errorsForTarget(errors, 'A').map((e) => e.message)).toEqual(['too few A', 'A or B issue']);
    expect(errorsForTarget(errors, 'B').map((e) => e.message)).toEqual(['A or B issue']);
    expect(errorsForTarget(errors, 'C')).toEqual([]);
  });

  it('globalErrors returns only errors with no targets', () => {
    expect(globalErrors(errors).map((e) => e.message)).toEqual(['over cap']);
  });
});

describe('usedUnits / usedUpgrades', () => {
  it('returns only units with number > 0 and merges used upgrades', () => {
    get().setArmy('empire');
    get().setUnitUpgradeNumber('Halberdiers', 'Battle Banner', 1);

    const used = usedUnits(get());
    // Only units with number > 0 are returned (Halberdiers auto-includes at its min).
    expect(used.Halberdiers).toBeDefined();
    expect(Object.values(used).every((u) => u.number > 0)).toBe(true);
    // used upgrade merges the global upgrade record with the unit entry
    const banner = used.Halberdiers.upgrades!['Battle Banner'];
    expect(banner.number).toBe(1);
    expect(banner.type).toBe('Magic Standard'); // from the global record
  });

  it('usedUpgrades returns only global upgrades with number > 0', () => {
    get().setArmy('empire');
    get().setUnitNumber('Halberdiers', 2);
    get().setUnitUpgradeNumber('Halberdiers', 'Battle Banner', 1);

    const used = usedUpgrades(get());
    expect(Object.keys(used)).toContain('Battle Banner');
    expect(used['Battle Banner'].number).toBe(1);
    expect(used.Griffon).toBeUndefined();
  });
});
