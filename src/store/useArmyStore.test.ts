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
    expect(state.units.general.number).toBe(1);
    expect(pointsCost(state)).toBe(expectedTotal);
  });

  it('merges magic-item upgrades into the global upgrades map', () => {
    get().setArmy('empire');
    // army upgrade plus a magic-item upgrade both present
    expect(get().upgrades.griffon).toBeDefined();
    expect(get().upgrades.crownOfCommand).toBeDefined();
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
    expect(Object.keys(defined(get().units.general.upgrades, 'upgrades'))).toContain(
      'crownOfCommand',
    );
    // Infantry gets the Battle Banner
    expect(Object.keys(defined(get().units.halberdiers.upgrades, 'upgrades'))).toContain(
      'battleBanner',
    );
  });

  it('does not attach magic upgrades to a noMagic unit', () => {
    get().setArmy('empire');
    // Skirmishers are noMagic -> no Battle Banner
    const skirmisherUpgrades = get().units.skirmishers.upgrades;
    expect(skirmisherUpgrades && 'battleBanner' in skirmisherUpgrades).toBeFalsy();
  });
});

describe('setUnitNumber', () => {
  it('computes pointsCost = number * points and reflects it in the total', () => {
    get().setArmy('goblin');
    get().setUnitNumber('goblins', GOBLINS_ABOVE_FLOOR);

    expect(get().units.goblins.number).toBe(GOBLINS_ABOVE_FLOOR);
    expect(get().units.goblins.pointsCost).toBe(GOBLINS_ABOVE_FLOOR * GOBLIN_POINTS);
    // The total sums every unit's cost, including auto-included minimums.
    const total = Object.values(get().units).reduce((sum, u) => sum + u.pointsCost, 0);
    expect(pointsCost(get())).toBe(total);
  });

  it('clamps a below-floor number up to the force-limit minimum', () => {
    get().setArmy('goblin');
    get().setUnitNumber('goblins', NEGATIVE_COUNT);
    const floor = resolveBounds(get().units.goblins, get().gameSize).min;
    expect(get().units.goblins.number).toBe(floor);
  });
});

describe('setUnitUpgradeNumber - plain +N points', () => {
  it('folds the upgrade cost into the unit and updates the global total', () => {
    get().setArmy('empire');
    get().setUnitNumber('halberdiers', HALBERDIERS_ABOVE_FLOOR);
    get().setUnitUpgradeNumber('halberdiers', 'battleBanner', 1);

    const unit = get().units.halberdiers;
    const banner = defined(unit.upgrades, 'upgrades').battleBanner;
    const expectedCost = HALBERDIERS_ABOVE_FLOOR * HALBERDIER_POINTS + BATTLE_BANNER_POINTS;

    expect(banner.number).toBe(1);
    expect(banner.pointsCost).toBe(BATTLE_BANNER_POINTS);
    expect(unit.pointsCost).toBe(expectedCost);
    expect(get().upgrades.battleBanner.number).toBe(1); // global total
  });
});

describe('setUnitUpgradeNumber - variable pricing', () => {
  it('uses the pointsValue lookup (Knights armour 4+ -> +50)', () => {
    get().setArmy('empire');
    get().setUnitNumber('knights', 2);
    get().setUnitUpgradeNumber('knights', 'bannerOfShielding', 1);

    const unit = get().units.knights;
    const banner = defined(unit.upgrades, 'upgrades').bannerOfShielding;
    const expectedCost = 2 * KNIGHT_POINTS + SHIELDING_ON_ARMOUR_4_POINTS;

    expect(banner.pointsCost).toBe(SHIELDING_ON_ARMOUR_4_POINTS);
    expect(unit.pointsCost).toBe(expectedCost);
    expect(get().upgrades.bannerOfShielding.number).toBe(1);
  });
});

describe('clamping and cascades', () => {
  it('clamps a unit-upgrade number to the unit number', () => {
    get().setArmy('empire');
    get().setUnitNumber('halberdiers', HALBERDIERS_ABOVE_FLOOR);
    get().setUnitUpgradeNumber('halberdiers', 'battleBanner', MORE_BANNERS_THAN_STANDS);

    const banner = defined(get().units.halberdiers.upgrades, 'upgrades').battleBanner;

    expect(banner.number).toBe(HALBERDIERS_ABOVE_FLOOR);
    expect(get().upgrades.battleBanner.number).toBe(HALBERDIERS_ABOVE_FLOOR);
  });

  it('reducing the unit number reduces over-limit upgrades and keeps the global total in sync', () => {
    const startingStands = HALBERDIERS_ABOVE_FLOOR + 1;

    get().setArmy('empire');
    get().setUnitNumber('halberdiers', startingStands);
    get().setUnitUpgradeNumber('halberdiers', 'battleBanner', startingStands);
    expect(get().upgrades.battleBanner.number).toBe(startingStands);

    get().setUnitNumber('halberdiers', HALBERDIER_FLOOR);

    const banner = defined(get().units.halberdiers.upgrades, 'upgrades').battleBanner;
    const expectedCost = HALBERDIER_FLOOR * (HALBERDIER_POINTS + BATTLE_BANNER_POINTS);

    expect(banner.number).toBe(HALBERDIER_FLOOR);
    expect(get().upgrades.battleBanner.number).toBe(HALBERDIER_FLOOR);
    expect(get().units.halberdiers.pointsCost).toBe(expectedCost);
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
      units: { knights: 2, NotAUnit: 9 },
      upgrades: {},
    };

    get().setArmy('empire');
    get().applyList(list);

    const s = get();
    expect(s.gameSize).toBe(list.gameSize);
    expect(s.units.knights.number).toBe(list.units.knights);
    expect(s.units.NotAUnit).toBeUndefined();
  });

  it('clears prior selections when loading a second list', () => {
    const first = {
      name: 'first',
      gameSize: 1000,
      units: { halberdiers: 5 },
      upgrades: { halberdiers: { battleBanner: 1 } },
    };

    get().setArmy('empire');
    get().applyList(first);
    expect(get().units.halberdiers.number).toBe(first.units.halberdiers);
    expect(get().units.halberdiers.upgrades?.battleBanner?.number).toBe(1);

    get().applyList({
      name: 'second',
      gameSize: 2000,
      units: { knights: 2 },
      upgrades: {},
    });

    const s = get();
    expect(s.units.knights.number).toBe(2);
    // Halberdiers (and its upgrade) were in the first list but not the second;
    // they must not carry over.
    expect(s.units.halberdiers.upgrades?.battleBanner?.number ?? 0).toBe(0);
    expect(s.upgrades.battleBanner.number).toBe(0);
  });
});

describe('force limits', () => {
  it('locks the General at 1 (armyMin == armyMax == 1)', () => {
    get().setArmy('goblin');
    expect(get().units.goblinWarboss.number).toBe(1);

    get().setUnitNumber('goblinWarboss', 0); // try to remove
    expect(get().units.goblinWarboss.number).toBe(1);

    get().setUnitNumber('goblinWarboss', MORE_THAN_ARMY_MAX); // try to exceed armyMax
    expect(get().units.goblinWarboss.number).toBe(1);
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
    'ringOfMagic',
    'staffOfSpellbinding',
    'scrollOfDispelling',
    'wandOfPower',
    'rodOfRepetition',
  ];

  const generalUpgrades = () => Object.keys(defined(get().units.general.upgrades));

  beforeEach(() => {
    get().setArmy('kislev');
  });

  it('adds the add-on upgrades to the unit when the upgrade is first taken', () => {
    expect(generalUpgrades()).not.toContain(TZARINA_ITEMS[0]);

    get().setUnitUpgradeNumber('general', 'tzarina', 1);

    expect(generalUpgrades()).toEqual(expect.arrayContaining(TZARINA_ITEMS));
  });

  it('removes the add-on upgrades when the upgrade drops to zero', () => {
    get().setUnitUpgradeNumber('general', 'tzarina', 1);
    get().setUnitUpgradeNumber('general', 'tzarina', 0);

    for (const item of TZARINA_ITEMS) {
      expect(generalUpgrades()).not.toContain(item);
    }
  });
});
