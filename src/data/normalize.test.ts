import { describe, expect, it } from 'vitest';
import { indexById, normalizeArmy, normalizeMagicItems } from './normalize';
import type { RawArmy } from './types';

const goblins = { id: 'goblins', code: 0, name: 'Goblins', type: 'Infantry', points: 30 };
const wolfRiders = { id: 'wolfRiders', code: 1, name: 'Wolf Riders', type: 'Cavalry', points: 60 };

const RAW_ARMY: RawArmy = {
  name: 'Goblin',
  version: 'Warmaster Revolution',
  group: 0,
  order: 0,
  units: [goblins, wolfRiders],
  upgrades: [{ id: 'banner', code: 0, name: 'Banner', type: 'Standard' }],
  specialRules: [{ id: 'goblins', name: 'Goblins', text: ['Sneaky.'] }],
};

describe('indexById', () => {
  it('keys each entity by its id, keeping list order', () => {
    const indexed = indexById([goblins, wolfRiders], 'units');

    expect(Object.keys(indexed)).toEqual(['goblins', 'wolfRiders']);
    expect(indexed.wolfRiders).toBe(wolfRiders);
  });

  it('throws on a duplicate id, naming the list and the id', () => {
    expect(() => indexById([goblins, goblins], 'units')).toThrow(/units.*goblins/);
  });
});

describe('normalizeArmy', () => {
  it('turns the units, upgrades and special rules lists into records by id', () => {
    const army = normalizeArmy(RAW_ARMY);

    expect(Object.keys(army.units)).toEqual(['goblins', 'wolfRiders']);
    expect(army.upgrades?.banner.name).toBe('Banner');
    expect(army.specialRules?.goblins.text).toEqual(['Sneaky.']);
  });

  it('keeps the other army fields', () => {
    const army = normalizeArmy(RAW_ARMY);

    expect(army.name).toBe('Goblin');
    expect(army.version).toBe('Warmaster Revolution');
  });

  it('leaves optional lists undefined when the army has none', () => {
    const army = normalizeArmy({ ...RAW_ARMY, upgrades: undefined, specialRules: undefined });

    expect(army.upgrades).toBeUndefined();
    expect(army.specialRules).toBeUndefined();
  });
});

describe('normalizeMagicItems', () => {
  it('turns the magic items list into a record by id', () => {
    const item = {
      id: 'sword',
      code: 100,
      name: 'Sword',
      type: 'Magic Weapon',
      points: '10',
      text: [],
    };
    const file = normalizeMagicItems({ upgrades: [item], upgradeConstraints: [] });

    expect(file.upgrades.sword).toBe(item);
    expect(file.upgradeConstraints).toEqual([]);
  });
});
