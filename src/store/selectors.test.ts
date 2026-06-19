import { describe, it, expect, beforeEach } from 'vitest';
import { useArmyStore } from './useArmyStore';
import {
  pointsCost,
  armySize,
  unitCount,
  breakPoint,
  usedUnits,
  usedUpgrades,
  errorsForTarget,
  globalErrors,
  groupRosterUnits,
  isCharacter,
} from './selectors';
import type { UnitState } from './storeHelpers';
import type { ValidationError } from '../data/types';

/** Build a minimal units map keyed in insertion order; only `type` matters here. */
function unitsOf(entries: [string, string][]): Record<string, UnitState> {
  const map: Record<string, UnitState> = {};
  for (const [id, type] of entries) {
    map[id] = { type } as UnitState;
  }
  return map;
}

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

describe('breakPoint', () => {
  it('is 0 for an empty army', () => {
    expect(breakPoint({})).toBe(0);
  });

  it('is half the counted units, rounded up', () => {
    get().setArmy('goblin');
    get().setUnitNumber('Goblins', 5); // counted units
    const count = unitCount(get().units);
    expect(breakPoint(get().units)).toBe(Math.ceil(count / 2));
  });

  it('tracks unitCount (ignores noCount units)', () => {
    get().setArmy('empire');
    const before = breakPoint(get().units);
    get().setUnitNumber('Skirmishers', get().units.Skirmishers.number + 2); // noCount
    expect(breakPoint(get().units)).toBe(before);
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

describe('groupRosterUnits', () => {
  const units = unitsOf([
    ['Goblin Warboss', 'General'],
    ['Goblin Bigboss', 'Hero'],
    ['Shaman', 'Wizard'],
    ['Goblins', 'Infantry'],
    ['Spider Riders', 'Infantry'],
    ['Wolf Riders', 'Cavalry'],
    ['Wolf Chariots', 'Chariot'],
    ['Giant', 'Monster'],
    ['Doom Diver', 'Artillery'],
    ['Pump Wagon', 'Machine'],
  ]);

  it('groups characters first, then troop types in canonical order', () => {
    const groups = groupRosterUnits(units);
    expect(groups.map((g) => g.label)).toEqual([
      'Characters',
      'Infantry',
      'Cavalry',
      'Chariot',
      'Monster',
      'Artillery',
      'Machine',
    ]);
  });

  it('folds General/Hero/Wizard into one Characters group, preserving order', () => {
    const groups = groupRosterUnits(units);
    const characters = groups.find((g) => g.label === 'Characters');
    expect(characters?.unitIds).toEqual(['Goblin Warboss', 'Goblin Bigboss', 'Shaman']);
  });

  it('preserves existing order within a troop group', () => {
    const groups = groupRosterUnits(units);
    const infantry = groups.find((g) => g.label === 'Infantry');
    expect(infantry?.unitIds).toEqual(['Goblins', 'Spider Riders']);
  });

  it('filters by a case-insensitive name query, dropping now-empty groups', () => {
    const groups = groupRosterUnits(units, 'wolf');
    expect(groups.map((g) => g.label)).toEqual(['Cavalry', 'Chariot']);
    expect(groups.flatMap((g) => g.unitIds)).toEqual(['Wolf Riders', 'Wolf Chariots']);
  });

  it('returns no groups when the query matches nothing', () => {
    expect(groupRosterUnits(units, 'dragon')).toEqual([]);
  });

  it('ignores surrounding whitespace in the query', () => {
    const groups = groupRosterUnits(units, '  giant  ');
    expect(groups.map((g) => g.label)).toEqual(['Monster']);
  });

  it('floats mandatory units (resolved min > 0) to the top of their group when a gameSize is given', () => {
    const mandatoryUnits: Record<string, UnitState> = {
      Goblins: { type: 'Infantry' } as UnitState,
      'Goblin Horde': { type: 'Infantry', armyMin: 1 } as UnitState,
      'Spider Riders': { type: 'Infantry' } as UnitState,
    };
    const infantry = groupRosterUnits(mandatoryUnits, '', 2000).find((g) => g.label === 'Infantry');
    expect(infantry?.unitIds).toEqual(['Goblin Horde', 'Goblins', 'Spider Riders']);
  });

  it('keeps the units-map order when no gameSize is given', () => {
    const mandatoryUnits: Record<string, UnitState> = {
      Goblins: { type: 'Infantry' } as UnitState,
      'Goblin Horde': { type: 'Infantry', armyMin: 1 } as UnitState,
    };
    const infantry = groupRosterUnits(mandatoryUnits).find((g) => g.label === 'Infantry');
    expect(infantry?.unitIds).toEqual(['Goblins', 'Goblin Horde']);
  });
});

describe('isCharacter', () => {
  it('is true for General, Hero, and Wizard', () => {
    expect(isCharacter('General')).toBe(true);
    expect(isCharacter('Hero')).toBe(true);
    expect(isCharacter('Wizard')).toBe(true);
  });

  it('is false for troop types', () => {
    expect(isCharacter('Infantry')).toBe(false);
    expect(isCharacter('Cavalry')).toBe(false);
    expect(isCharacter('Monster')).toBe(false);
  });
});
