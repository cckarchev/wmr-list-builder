import { describe, it, expect, beforeEach } from 'vitest';
import { useArmyStore } from './useArmyStore';
import { pointsCost } from './selectors';
import { resolveBounds } from './forceLimits';
import { availablePrintSections } from '../components/print/printSections';

const get = () => useArmyStore.getState();

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
    expect(Object.keys(get().units.General.upgrades!)).toContain('Crown of Command');
    // Infantry gets the Battle Banner
    expect(Object.keys(get().units.Halberdiers.upgrades!)).toContain('Battle Banner');
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
    get().setUnitNumber('Goblins', 10); // above the min floor (8 at 2,000)

    expect(get().units.Goblins.number).toBe(10);
    expect(get().units.Goblins.pointsCost).toBe(300); // 10 * 30
    // The total sums every unit's cost, including auto-included minimums.
    const total = Object.values(get().units).reduce((sum, u) => sum + u.pointsCost, 0);
    expect(pointsCost(get())).toBe(total);
  });

  it('clamps a below-floor number up to the force-limit minimum', () => {
    get().setArmy('goblin');
    get().setUnitNumber('Goblins', -5);
    const floor = resolveBounds(get().units.Goblins, get().gameSize).min;
    expect(get().units.Goblins.number).toBe(floor); // 8 at 2,000
  });
});

describe('setUnitUpgradeNumber - plain +N points', () => {
  it('folds the upgrade cost into the unit and updates the global total', () => {
    get().setArmy('empire');
    get().setUnitNumber('Halberdiers', 5); // >= min floor (4 at 2,000)
    get().setUnitUpgradeNumber('Halberdiers', 'Battle Banner', 1);

    const unit = get().units.Halberdiers;
    expect(unit.upgrades!['Battle Banner'].number).toBe(1);
    expect(unit.upgrades!['Battle Banner'].pointsCost).toBe(30); // +30
    expect(unit.pointsCost).toBe(5 * 45 + 30); // 255
    expect(get().upgrades['Battle Banner'].number).toBe(1); // global total
  });
});

describe('setUnitUpgradeNumber - variable pricing', () => {
  it('uses the pointsValue lookup (Knights armour 4+ -> +50)', () => {
    get().setArmy('empire');
    get().setUnitNumber('Knights', 2);
    get().setUnitUpgradeNumber('Knights', 'Banner of Shielding', 1);

    const unit = get().units.Knights;
    expect(unit.upgrades!['Banner of Shielding'].pointsCost).toBe(50); // armour 4+ -> +50
    expect(unit.pointsCost).toBe(2 * 110 + 50); // 270
    expect(get().upgrades['Banner of Shielding'].number).toBe(1);
  });
});

describe('clamping and cascades', () => {
  it('clamps a unit-upgrade number to the unit number', () => {
    get().setArmy('empire');
    get().setUnitNumber('Halberdiers', 5);
    get().setUnitUpgradeNumber('Halberdiers', 'Battle Banner', 9);

    expect(get().units.Halberdiers.upgrades!['Battle Banner'].number).toBe(5);
    expect(get().upgrades['Battle Banner'].number).toBe(5);
  });

  it('reducing the unit number reduces over-limit upgrades and keeps the global total in sync', () => {
    get().setArmy('empire');
    get().setUnitNumber('Halberdiers', 6);
    get().setUnitUpgradeNumber('Halberdiers', 'Battle Banner', 6);
    expect(get().upgrades['Battle Banner'].number).toBe(6);

    get().setUnitNumber('Halberdiers', 4); // == min floor at 2,000
    expect(get().units.Halberdiers.upgrades!['Battle Banner'].number).toBe(4);
    expect(get().upgrades['Battle Banner'].number).toBe(4);
    expect(get().units.Halberdiers.pointsCost).toBe(4 * 45 + 4 * 30); // 300
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
    get().setArmy('empire');
    get().applyList({
      name: '',
      gameSize: 1000,
      units: { Knights: 2, NotAUnit: 9 },
      upgrades: {},
    });
    const s = get();
    expect(s.gameSize).toBe(1000);
    expect(s.units.Knights.number).toBe(2);
    expect(s.units.NotAUnit).toBeUndefined();
  });

  it('clears prior selections when loading a second list', () => {
    get().setArmy('empire');
    get().applyList({
      name: 'first',
      gameSize: 1000,
      units: { Halberdiers: 5 },
      upgrades: { Halberdiers: { 'Battle Banner': 1 } },
    });
    expect(get().units.Halberdiers.number).toBe(5);
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

    get().setUnitNumber('Goblin Warboss', 5); // try to exceed armyMax
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
