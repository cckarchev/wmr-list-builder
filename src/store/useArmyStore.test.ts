import { describe, it, expect, beforeEach } from 'vitest';
import { useArmyStore } from './useArmyStore';
import { pointsCost } from './selectors';

const get = () => useArmyStore.getState();

beforeEach(() => {
  get().reset();
});

describe('setArmy', () => {
  it('loads an army with all unit/upgrade numbers at 0 and pointsCost 0', () => {
    get().setArmy('empire');
    const state = get();

    expect(state.armyId).toBe('empire');
    expect(state.version).toBe('Warmaster Revolution');
    expect(state.magic).toBe(true);
    expect(state.label).toBe('');

    for (const unit of Object.values(state.units)) {
      expect(unit.number).toBe(0);
      expect(unit.pointsCost).toBe(0);
    }
    for (const upgrade of Object.values(state.upgrades)) {
      expect(upgrade.number).toBe(0);
    }
    expect(pointsCost(state)).toBe(0);
  });

  it('merges magic-item upgrades into the global upgrades map', () => {
    get().setArmy('empire');
    // army upgrade plus a magic-item upgrade both present
    expect(get().upgrades.Griffon).toBeDefined();
    expect(get().upgrades['Crown of Command']).toBeDefined();
  });

  it('builds the Empire printableItems list (no Army Rules, has Special Rules + Magic + Spells)', () => {
    get().setArmy('empire');
    const abbrs = get().printableItems.map((p) => p.abbr);
    expect(abbrs).toEqual(['l', 's', 'sl', 'sr', 'sru', 'mi', 'miu', 'sp']);
    expect(get().printItems).toEqual([]);
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
    get().setUnitNumber('Goblins', 3);

    expect(get().units.Goblins.number).toBe(3);
    expect(get().units.Goblins.pointsCost).toBe(90); // 3 * 30
    expect(pointsCost(get())).toBe(90);
  });

  it('clamps negative numbers to 0', () => {
    get().setArmy('goblin');
    get().setUnitNumber('Goblins', -5);
    expect(get().units.Goblins.number).toBe(0);
  });
});

describe('setUnitUpgradeNumber - plain +N points', () => {
  it('folds the upgrade cost into the unit and updates the global total', () => {
    get().setArmy('empire');
    get().setUnitNumber('Halberdiers', 3);
    get().setUnitUpgradeNumber('Halberdiers', 'Battle Banner', 1);

    const unit = get().units.Halberdiers;
    expect(unit.upgrades!['Battle Banner'].number).toBe(1);
    expect(unit.upgrades!['Battle Banner'].pointsCost).toBe(30); // +30
    expect(unit.pointsCost).toBe(3 * 45 + 30); // 165
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
    get().setUnitNumber('Halberdiers', 2);
    get().setUnitUpgradeNumber('Halberdiers', 'Battle Banner', 5);

    expect(get().units.Halberdiers.upgrades!['Battle Banner'].number).toBe(2);
    expect(get().upgrades['Battle Banner'].number).toBe(2);
  });

  it('reducing the unit number reduces over-limit upgrades and keeps the global total in sync', () => {
    get().setArmy('empire');
    get().setUnitNumber('Halberdiers', 5);
    get().setUnitUpgradeNumber('Halberdiers', 'Battle Banner', 3);
    expect(get().upgrades['Battle Banner'].number).toBe(3);

    get().setUnitNumber('Halberdiers', 1);
    expect(get().units.Halberdiers.upgrades!['Battle Banner'].number).toBe(1);
    expect(get().upgrades['Battle Banner'].number).toBe(1);
    expect(get().units.Halberdiers.pointsCost).toBe(1 * 45 + 30); // 75
  });
});

describe('print items + label', () => {
  it('moves an item between printableItems and printItems', () => {
    get().setArmy('empire');
    const firstTitle = get().printableItems[0].title;
    get().addPrintItem(0);
    expect(get().printItems.map((p) => p.title)).toContain(firstTitle);
    expect(get().printableItems.map((p) => p.title)).not.toContain(firstTitle);

    get().removePrintItem(0);
    expect(get().printItems).toEqual([]);
    expect(get().printableItems.map((p) => p.title)).toContain(firstTitle);
  });

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
      gameSize: 1000,
      units: { Knights: 2, NotAUnit: 9 },
      upgrades: {},
    });
    const s = get();
    expect(s.gameSize).toBe(1000);
    expect(s.units.Knights.number).toBe(2);
    expect(s.units.NotAUnit).toBeUndefined();
  });
});
