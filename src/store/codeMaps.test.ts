import { describe, it, expect } from 'vitest';
import { buildCodeMaps } from './persistence';
import { loadArmy } from '../data/loadArmy';

describe('buildCodeMaps', () => {
  it('maps unit names to ids and back', () => {
    const army = loadArmy('empire');
    const maps = buildCodeMaps(army);
    const [name, unit] = Object.entries(army.units)[0];
    expect(maps.unitIdByName.get(name)).toBe(unit.id);
    expect(maps.unitNameById.get(unit.id)).toBe(name);
  });

  it('includes army upgrades and magic items (ids >= 100) in the upgrade maps', () => {
    const maps = buildCodeMaps(loadArmy('empire'));
    // every mapped upgrade round-trips
    for (const [name, id] of maps.upgradeIdByName) {
      expect(maps.upgradeNameById.get(id)).toBe(name);
    }
    // at least one magic-item id (>= 100) is present
    expect([...maps.upgradeNameById.keys()].some((id) => id >= 100)).toBe(true);
  });
});
