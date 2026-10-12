import { describe, expect, it } from 'vitest';
import { armiesById, armyIndex } from './armyIndex';
import { loadArmy } from './loadArmy';

const REVOLUTION_ARMY_COUNT = 25;
const GOBLIN_POINTS = 30;

describe('army index', () => {
  it('loads all 25 Revolution armies', () => {
    expect(armyIndex).toHaveLength(REVOLUTION_ARMY_COUNT);
  });
  it('every army is Warmaster Revolution', () => {
    for (const { id } of armyIndex) {
      expect(loadArmy(id).version).toBe('Warmaster Revolution');
    }
  });
  it('is sorted by name', () => {
    const names = armyIndex.map((a) => a.name);

    expect([...names].sort((x, y) => x.localeCompare(y))).toEqual(names);
  });
  it('throws on unknown id', () => {
    expect(() => loadArmy('nope')).toThrow(/Unknown army/);
  });
  it('exposes goblin units', () => {
    expect(armiesById.goblin.units.goblins.points).toBe(GOBLIN_POINTS);
  });
});
