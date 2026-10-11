import { describe, expect, it } from 'vitest';
import { armiesById } from '@/data/armyIndex';
import { MAGIC_ITEM_CODE_MIN, magicItems } from '@/data/magicItems';

/** A lowercase letter, then letters and digits only. */
const CAMEL_CASE = /^[a-z][a-zA-Z0-9]*$/;

describe('stable codes', () => {
  it('every unit and army upgrade has a unique numeric code within its army', () => {
    for (const [armyId, army] of Object.entries(armiesById)) {
      const unitCodes = Object.values(army.units).map((u) => u.code);
      expect(
        unitCodes.every((code) => typeof code === 'number'),
        `${armyId} units`,
      ).toBe(true);
      expect(new Set(unitCodes).size, `${armyId} unit codes unique`).toBe(unitCodes.length);

      const upgradeCodes = Object.values(army.upgrades ?? {}).map((u) => u.code);
      expect(
        upgradeCodes.every((code) => typeof code === 'number'),
        `${armyId} upgrades`,
      ).toBe(true);
      expect(new Set(upgradeCodes).size, `${armyId} upgrade codes unique`).toBe(
        upgradeCodes.length,
      );
    }
  });

  it('magic items have unique numeric codes from MAGIC_ITEM_CODE_MIN up', () => {
    const codes = Object.values(magicItems.upgrades).map((m) => m.code);
    expect(codes.every((code) => typeof code === 'number' && code >= MAGIC_ITEM_CODE_MIN)).toBe(
      true,
    );
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('every entity id is camelCase and matches its key', () => {
    const records = [
      ...Object.values(armiesById).flatMap((army) => [
        army.units,
        army.upgrades ?? {},
        army.specialRules ?? {},
      ]),
      magicItems.upgrades,
    ];
    const mismatched = records.flatMap((record) =>
      Object.entries(record)
        .filter(([key, entity]) => entity.id !== key || !CAMEL_CASE.test(entity.id))
        .map(([key, entity]) => `${key} -> ${entity.id}`),
    );

    expect(mismatched).toEqual([]);
  });
});
