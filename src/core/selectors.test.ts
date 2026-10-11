import { beforeEach, describe, expect, it } from 'vitest';
import type { ValidationError } from '@/data/types';
import { DEFAULT_GAME_SIZE } from '@/store/armyData';
import { useArmyStore } from '@/store/useArmyStore';
import { defined } from '@/test/defined';
import {
  armySize,
  breakPoint,
  errorsForTarget,
  globalErrors,
  groupRosterUnits,
  isCharacter,
  POINTS_PER_ARMY_SIZE,
  pointsCost,
  unitCount,
  usedUnits,
} from './selectors';
import type { UnitState } from './storeHelpers';

const JUST_UNDER_ONE_STEP = 999;
const TWO_AND_A_HALF_STEPS = 2500;
const THREE_STEPS = 3000;
const ADDED_HALBERDIERS = 3;
/** An odd count, so the break point has to round up. */
const GOBLIN_STANDS = 5;
const SPEARMEN_STANDS = 4;
const SCOUT_STANDS = 2;

/** Build a minimal units map keyed in insertion order, each unit named after its key. */
const unitsOf = (entries: [string, string][]): Record<string, UnitState> => {
  const map: Record<string, UnitState> = {};

  for (const [id, type] of entries) {
    map[id] = { name: id, type } as UnitState;
  }

  return map;
};

const get = () => useArmyStore.getState();

beforeEach(() => {
  get().reset();
});

describe('armySize', () => {
  it('is at least 1', () => {
    expect(armySize(0)).toBe(1);
    expect(armySize(JUST_UNDER_ONE_STEP)).toBe(1);
  });
  it('grows per 1000 points', () => {
    expect(armySize(TWO_AND_A_HALF_STEPS)).toBe(2);
    expect(armySize(THREE_STEPS)).toBe(THREE_STEPS / POINTS_PER_ARMY_SIZE);
  });
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

describe('errorsForTarget / globalErrors', () => {
  const errors: ValidationError[] = [
    { message: 'over cap', targets: [] },
    { message: 'too few A', targets: ['A'] },
    { message: 'A or B issue', targets: ['A', 'B'] },
  ];

  it('errorsForTarget returns every error naming the id', () => {
    expect(errorsForTarget(errors, 'A').map((e) => e.message)).toEqual([
      'too few A',
      'A or B issue',
    ]);
    expect(errorsForTarget(errors, 'B').map((e) => e.message)).toEqual(['A or B issue']);
    expect(errorsForTarget(errors, 'C')).toEqual([]);
  });

  it('globalErrors returns only errors with no targets', () => {
    expect(globalErrors(errors).map((e) => e.message)).toEqual(['over cap']);
  });
});

describe('usedUnits', () => {
  it('returns only units with number > 0 and merges used upgrades', () => {
    get().setArmy('empire');
    get().setUnitUpgradeNumber('halberdiers', 'battleBanner', 1);

    const used = usedUnits(get());
    // Only units with number > 0 are returned (Halberdiers auto-includes at its min).
    expect(used.halberdiers).toBeDefined();
    expect(Object.values(used).every((u) => u.number > 0)).toBe(true);
    // used upgrade merges the global upgrade record with the unit entry
    const banner = defined(used.halberdiers.upgrades, 'upgrades').battleBanner;
    expect(banner.number).toBe(1);
    expect(banner.type).toBe('Magic Standard'); // from the global record
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

  it('matches the query against the display name, not the id', () => {
    const named = {
      wr: { name: 'Wolf Riders', type: 'Cavalry' } as UnitState,
      gob: { name: 'Goblins', type: 'Infantry' } as UnitState,
    };

    expect(groupRosterUnits(named, 'wolf').flatMap((g) => g.unitIds)).toEqual(['wr']);
    expect(groupRosterUnits(named, 'wr')).toEqual([]);
  });

  it('returns no groups when the query matches nothing', () => {
    expect(groupRosterUnits(units, 'dragon')).toEqual([]);
  });

  it('ignores surrounding whitespace in the query', () => {
    const groups = groupRosterUnits(units, '  giant  ');
    expect(groups.map((g) => g.label)).toEqual(['Monster']);
  });
});

describe('groupRosterUnits with mandatory units', () => {
  it('floats mandatory units (resolved min > 0) to the top of their group when a gameSize is given', () => {
    const mandatoryUnits: Record<string, UnitState> = {
      goblins: { type: 'Infantry' } as UnitState,
      goblinHorde: { type: 'Infantry', armyMin: 1 } as UnitState,
      spiderRiders: { type: 'Infantry' } as UnitState,
    };
    const infantry = groupRosterUnits(mandatoryUnits, '', DEFAULT_GAME_SIZE).find(
      (g) => g.label === 'Infantry',
    );
    expect(infantry?.unitIds).toEqual(['goblinHorde', 'goblins', 'spiderRiders']);
  });

  it('keeps the units-map order when no gameSize is given', () => {
    const mandatoryUnits: Record<string, UnitState> = {
      goblins: { type: 'Infantry' } as UnitState,
      goblinHorde: { type: 'Infantry', armyMin: 1 } as UnitState,
    };
    const infantry = groupRosterUnits(mandatoryUnits).find((g) => g.label === 'Infantry');
    expect(infantry?.unitIds).toEqual(['goblins', 'goblinHorde']);
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
