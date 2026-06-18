import { describe, it, expect } from 'vitest';
import { armyIndex, armiesById } from './armyIndex';
import { loadArmy } from './loadArmy';

describe('army index', () => {
  it('loads all 25 Revolution armies', () => {
    expect(armyIndex).toHaveLength(25);
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
    expect(armiesById.goblin.units.Goblins.points).toBe(30);
  });
});
