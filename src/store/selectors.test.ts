import { describe, it, expect, beforeEach } from 'vitest';
import { useArmyStore } from './useArmyStore';
import { pointsCost, armySize, unitCount, usedUnits, usedUpgrades } from './selectors';

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
    get().setUnitNumber('Goblins', 2); // 60
    get().setUnitNumber('Trolls', 0);
    expect(pointsCost(get())).toBe(get().units.Goblins.pointsCost);
  });
});

describe('unitCount', () => {
  it('excludes noCount units', () => {
    get().setArmy('empire');
    get().setUnitNumber('Halberdiers', 3);
    get().setUnitNumber('Skirmishers', 2); // noCount
    expect(unitCount(get().units)).toBe(3);
  });
});

describe('usedUnits / usedUpgrades', () => {
  it('returns only units with number > 0 and merges used upgrades', () => {
    get().setArmy('empire');
    get().setUnitNumber('Halberdiers', 2);
    get().setUnitUpgradeNumber('Halberdiers', 'Battle Banner', 1);

    const used = usedUnits(get());
    expect(Object.keys(used)).toEqual(['Halberdiers']);
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
