import { beforeEach, describe, expect, it } from 'vitest';
import { resolveBounds } from '@/core/forceLimits';
import { pointsCost } from '@/core/selectors';
import { availablePrintSections } from '@/screens/print/sections/printSections';
import { defined } from '@/test/defined';
import { useArmyStore } from './useArmyStore';

const get = () => useArmyStore.getState();

// Game data the cost assertions are built from (Empire and Goblin army JSON).
const GOBLIN_POINTS = 30;
const HALBERDIER_POINTS = 45;
const KNIGHT_POINTS = 110;
const BATTLE_BANNER_POINTS = 30;
/** Banner of Shielding is priced by armour; Knights have armour 4+. */
const SHIELDING_ON_ARMOUR_4_POINTS = 50;

// Force-limit floors at the default 2,000-point game.
const HALBERDIER_FLOOR = 4;

// Counts chosen relative to those limits.
const GOBLINS_ABOVE_FLOOR = 10;
const HALBERDIERS_ABOVE_FLOOR = HALBERDIER_FLOOR + 1;
const MORE_BANNERS_THAN_STANDS = 9;
const MORE_THAN_ARMY_MAX = 5;
const NEGATIVE_COUNT = -5;

beforeEach(() => {
  get().reset();
});

describe('setArmy', () => {
  it('loads an army with units at their armyMin floor (force limits)', () => {
    get().setArmy('empire');
    const state = get();

    expect(state.armyId).toBe('empire');
    expect(state.version).toBe('Warmaster Revolution');
    expect(state.magic).toBe(true);
    expect(state.label).toBe('');

    let expectedTotal = 0;
    for (const unit of Object.values(state.units)) {
      // Each unit auto-includes at its resolved hard minimum (armyMin plus any
      // point-scaled min at the default cap).
      const floor = resolveBounds(unit, state.gameSize).min;
      expect(unit.number).toBe(floor);
      expect(unit.pointsCost).toBe(floor * +unit.points);
      expectedTotal += unit.pointsCost;
    }
    for (const upgrade of Object.values(state.upgrades)) {
      expect(upgrade.number).toBe(0);
    }
    // The General (armyMin 1) is auto-included, so the base is non-zero.
    expect(state.units.General.number).toBe(1);
    expect(pointsCost(state)).toBe(expectedTotal);
  });

  it('merges magic-item upgrades into the global upgrades map', () => {
    get().setArmy('empire');
    // army upgrade plus a magic-item upgrade both present
    expect(get().upgrades.Griffon).toBeDefined();
    expect(get().upgrades['Crown of Command']).toBeDefined();
  });

  it('exposes Empire print sections (no Army Rules, has Special Rules + Magic + Spells)', () => {
    get().setArmy('empire');
    const s = get();
    const ids = availablePrintSections({
      hasArmyRules: !!s.army?.armyRules,
      hasSpecialRules: !!s.specialRules,
      magic: s.magic,
    }).map((section) => section.id);
    expect(ids).toEqual(['stats', 'specialRules', 'magicItems', 'spells']);
  });
});

describe('upgradeConstraints auto-attach', () => {
  it('attaches magic-item upgrades to an eligible unit', () => {
    get().setArmy('empire');
    // General (type "General") gets Crown of Command from the magic-item constraints
    expect(Object.keys(defined(get().units.General.upgrades, 'upgrades'))).toContain(
      'Crown of Command',
    );
    // Infantry gets the Battle Banner
    expect(Object.keys(defined(get().units.Halberdiers.upgrades, 'upgrades'))).toContain(
      'Battle Banner',
    );
  });

  it('does not attach magic upgrades to a noMagic unit', () => {
    get().setArmy('empire');
    // Skirmishers are noMagic -> no Battle Banner
    const skirmisherUpgrades = get().units.Skirmishers.upgrades;
    expect(skirmisherUpgrades && 'Battle Banner' in skirmisherUpgrades).toBeFalsy();
  });
});

describe('setUnitNumber', () => {
  it('computes pointsCost = number * points and reflects it in the total', () => {
    get().setArmy('goblin');
    get().setUnitNumber('Goblins', GOBLINS_ABOVE_FLOOR);

    expect(get().units.Goblins.number).toBe(GOBLINS_ABOVE_FLOOR);
    expect(get().units.Goblins.pointsCost).toBe(GOBLINS_ABOVE_FLOOR * GOBLIN_POINTS);
    // The total sums every unit's cost, including auto-included minimums.
    const total = Object.values(get().units).reduce((sum, u) => sum + u.pointsCost, 0);
    expect(pointsCost(get())).toBe(total);
  });

  it('clamps a below-floor number up to the force-limit minimum', () => {
    get().setArmy('goblin');
    get().setUnitNumber('Goblins', NEGATIVE_COUNT);
    const floor = resolveBounds(get().units.Goblins, get().gameSize).min;
    expect(get().units.Goblins.number).toBe(floor);
  });
});

describe('setUnitUpgradeNumber - plain +N points', () => {
  it('folds the upgrade cost into the unit and updates the global total', () => {
    get().setArmy('empire');
    get().setUnitNumber('Halberdiers', HALBERDIERS_ABOVE_FLOOR);
    get().setUnitUpgradeNumber('Halberdiers', 'Battle Banner', 1);

    const unit = get().units.Halberdiers;
    const banner = defined(unit.upgrades, 'upgrades')['Battle Banner'];
    const expectedCost = HALBERDIERS_ABOVE_FLOOR * HALBERDIER_POINTS + BATTLE_BANNER_POINTS;

    expect(banner.number).toBe(1);
    expect(banner.pointsCost).toBe(BATTLE_BANNER_POINTS);
    expect(unit.pointsCost).toBe(expectedCost);
    expect(get().upgrades['Battle Banner'].number).toBe(1); // global total
  });
});

describe('setUnitUpgradeNumber - variable pricing', () => {
  it('uses the pointsValue lookup (Knights armour 4+ -> +50)', () => {
    get().setArmy('empire');
    get().setUnitNumber('Knights', 2);
    get().setUnitUpgradeNumber('Knights', 'Banner of Shielding', 1);

    const unit = get().units.Knights;
    const banner = defined(unit.upgrades, 'upgrades')['Banner of Shielding'];
    const expectedCost = 2 * KNIGHT_POINTS + SHIELDING_ON_ARMOUR_4_POINTS;

    expect(banner.pointsCost).toBe(SHIELDING_ON_ARMOUR_4_POINTS);
    expect(unit.pointsCost).toBe(expectedCost);
    expect(get().upgrades['Banner of Shielding'].number).toBe(1);
  });
});

describe('clamping and cascades', () => {
  it('clamps a unit-upgrade number to the unit number', () => {
    get().setArmy('empire');
    get().setUnitNumber('Halberdiers', HALBERDIERS_ABOVE_FLOOR);
    get().setUnitUpgradeNumber('Halberdiers', 'Battle Banner', MORE_BANNERS_THAN_STANDS);

    const banner = defined(get().units.Halberdiers.upgrades, 'upgrades')['Battle Banner'];

    expect(banner.number).toBe(HALBERDIERS_ABOVE_FLOOR);
    expect(get().upgrades['Battle Banner'].number).toBe(HALBERDIERS_ABOVE_FLOOR);
  });

  it('reducing the unit number reduces over-limit upgrades and keeps the global total in sync', () => {
    const startingStands = HALBERDIERS_ABOVE_FLOOR + 1;

    get().setArmy('empire');
    get().setUnitNumber('Halberdiers', startingStands);
    get().setUnitUpgradeNumber('Halberdiers', 'Battle Banner', startingStands);
    expect(get().upgrades['Battle Banner'].number).toBe(startingStands);

    get().setUnitNumber('Halberdiers', HALBERDIER_FLOOR);

    const banner = defined(get().units.Halberdiers.upgrades, 'upgrades')['Battle Banner'];
    const expectedCost = HALBERDIER_FLOOR * (HALBERDIER_POINTS + BATTLE_BANNER_POINTS);

    expect(banner.number).toBe(HALBERDIER_FLOOR);
    expect(get().upgrades['Battle Banner'].number).toBe(HALBERDIER_FLOOR);
    expect(get().units.Halberdiers.pointsCost).toBe(expectedCost);
  });
});

describe('print items + label', () => {
  it('setLabel updates the label', () => {
    get().setArmy('empire');
    get().setLabel('My List');
    expect(get().label).toBe('My List');
  });
});

describe('applyList', () => {
  it('restores counts and gameSize, ignoring unknown ids', () => {
    const list = {
      name: '',
      gameSize: 1000,
      units: { Knights: 2, NotAUnit: 9 },
      upgrades: {},
    };

    get().setArmy('empire');
    get().applyList(list);

    const s = get();
    expect(s.gameSize).toBe(list.gameSize);
    expect(s.units.Knights.number).toBe(list.units.Knights);
    expect(s.units.NotAUnit).toBeUndefined();
  });

  it('clears prior selections when loading a second list', () => {
    const first = {
      name: 'first',
      gameSize: 1000,
      units: { Halberdiers: 5 },
      upgrades: { Halberdiers: { 'Battle Banner': 1 } },
    };

    get().setArmy('empire');
    get().applyList(first);
    expect(get().units.Halberdiers.number).toBe(first.units.Halberdiers);
    expect(get().units.Halberdiers.upgrades?.['Battle Banner']?.number).toBe(1);

    get().applyList({
      name: 'second',
      gameSize: 2000,
      units: { Knights: 2 },
      upgrades: {},
    });

    const s = get();
    expect(s.units.Knights.number).toBe(2);
    // Halberdiers (and its upgrade) were in the first list but not the second;
    // they must not carry over.
    expect(s.units.Halberdiers.upgrades?.['Battle Banner']?.number ?? 0).toBe(0);
    expect(s.upgrades['Battle Banner'].number).toBe(0);
  });
});

describe('force limits', () => {
  it('locks the General at 1 (armyMin == armyMax == 1)', () => {
    get().setArmy('goblin');
    expect(get().units['Goblin Warboss'].number).toBe(1);

    get().setUnitNumber('Goblin Warboss', 0); // try to remove
    expect(get().units['Goblin Warboss'].number).toBe(1);

    get().setUnitNumber('Goblin Warboss', MORE_THAN_ARMY_MAX); // try to exceed armyMax
    expect(get().units['Goblin Warboss'].number).toBe(1);
  });
});

describe('loadWarning', () => {
  it('setLoadWarning sets it and setArmy clears it', () => {
    get().setLoadWarning('boom');
    expect(get().loadWarning).toBe('boom');
    get().setArmy('empire');
    expect(get().loadWarning).toBeNull();
  });

  it('reset clears it', () => {
    get().setLoadWarning('boom');
    get().reset();
    expect(get().loadWarning).toBeNull();
  });
});

describe('savedBaseline', () => {
  it('tracks savedBaseline and clears it on setArmy/reset', () => {
    get().setArmy('bretonnia');
    expect(get().savedBaseline).toBeNull();
    get().setSavedBaseline('abc');
    expect(get().savedBaseline).toBe('abc');
    get().setArmy('bretonnia');
    expect(get().savedBaseline).toBeNull();
    get().setSavedBaseline('xyz');
    get().reset();
    expect(get().savedBaseline).toBeNull();
  });
});

describe('addOnUpgrades', () => {
  // The Kislev Tzarina, taken by the General, brings her own magic items.
  const TZARINA_ITEMS = [
    'Ring of Magic',
    'Staff of Spellbinding',
    'Scroll of Dispelling',
    'Wand of Power',
    'Rod of Repetition',
  ];

  const generalUpgrades = () => Object.keys(defined(get().units.General.upgrades));

  beforeEach(() => {
    get().setArmy('kislev');
  });

  it('adds the add-on upgrades to the unit when the upgrade is first taken', () => {
    expect(generalUpgrades()).not.toContain(TZARINA_ITEMS[0]);

    get().setUnitUpgradeNumber('General', 'Tzarina', 1);

    expect(generalUpgrades()).toEqual(expect.arrayContaining(TZARINA_ITEMS));
  });

  it('removes the add-on upgrades when the upgrade drops to zero', () => {
    get().setUnitUpgradeNumber('General', 'Tzarina', 1);
    get().setUnitUpgradeNumber('General', 'Tzarina', 0);

    for (const item of TZARINA_ITEMS) {
      expect(generalUpgrades()).not.toContain(item);
    }
  });
});
