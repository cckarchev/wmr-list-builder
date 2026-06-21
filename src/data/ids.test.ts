import { describe, it, expect } from 'vitest';
import { armiesById } from './armyIndex';
import { magicItems } from './magicItems';

describe('stable ids', () => {
  it('every unit and army upgrade has a unique numeric id within its army', () => {
    for (const [armyId, army] of Object.entries(armiesById)) {
      const unitIds = Object.values(army.units).map((u) => u.id);
      expect(
        unitIds.every((id) => typeof id === 'number'),
        `${armyId} units`,
      ).toBe(true);
      expect(new Set(unitIds).size, `${armyId} unit ids unique`).toBe(unitIds.length);

      const upIds = Object.values(army.upgrades ?? {}).map((u) => u.id);
      expect(
        upIds.every((id) => typeof id === 'number'),
        `${armyId} upgrades`,
      ).toBe(true);
      expect(new Set(upIds).size, `${armyId} upgrade ids unique`).toBe(upIds.length);
    }
  });

  it('magic items have unique numeric ids >= 100', () => {
    const ids = Object.values(magicItems.upgrades).map((m) => m.id);
    expect(ids.every((id) => typeof id === 'number' && id >= 100)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
