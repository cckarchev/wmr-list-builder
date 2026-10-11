import { describe, expect, it } from 'vitest';
import { armiesById } from './armyIndex';
import { magicItems } from './magicItems';
import type { Army } from './types';

const UNIT_REFERENCE_FIELDS = [
  'homologousUnits',
  'requiredUnits',
  'prohibitedUnits',
  'augendUnits',
] as const;

const UPGRADE_REFERENCE_FIELDS = [
  'addOnUpgrades',
  'homologousUpgrades',
  'requiredUpgrades',
  'prohibitedUpgrades',
] as const;

const UPGRADE_UNIT_REFERENCE_FIELDS = ['requiredUnits', 'prohibitedUnits'] as const;

/** Every reference in an army that does not resolve, as readable `owner.field -> id` lines. */
const danglingReferences = (army: Army): string[] => {
  const unitIds = new Set(Object.keys(army.units));
  const magicIds = army.magic ? Object.keys(magicItems.upgrades) : [];
  const upgradeIds = new Set([...Object.keys(army.upgrades ?? {}), ...magicIds]);
  const ruleIds = new Set(Object.keys(army.specialRules ?? {}));
  const dangling: string[] = [];

  const expectIn = (known: Set<string>, owner: string, field: string, ids?: string[]) => {
    for (const id of ids ?? []) {
      if (!known.has(id)) {
        dangling.push(`${owner}.${field} -> ${id}`);
      }
    }
  };

  for (const [unitId, unit] of Object.entries(army.units)) {
    expectIn(upgradeIds, unitId, 'upgrades', unit.upgrades);
    expectIn(ruleIds, unitId, 'specialRules', unit.specialRules);

    for (const field of UNIT_REFERENCE_FIELDS) {
      expectIn(unitIds, unitId, field, unit[field]);
    }
  }

  for (const [upgradeId, upgrade] of Object.entries(army.upgrades ?? {})) {
    expectIn(ruleIds, upgradeId, 'specialRules', upgrade.specialRules);

    for (const field of UPGRADE_REFERENCE_FIELDS) {
      expectIn(upgradeIds, upgradeId, field, upgrade[field]);
    }

    for (const field of UPGRADE_UNIT_REFERENCE_FIELDS) {
      expectIn(unitIds, upgradeId, field, upgrade[field]);
    }
  }

  for (const constraint of army.upgradeConstraints ?? []) {
    expectIn(upgradeIds, 'upgradeConstraints', 'upgrades', constraint.upgrades);
  }

  return dangling;
};

describe('data references', () => {
  it('every reference inside an army resolves to an existing entity', () => {
    for (const [armyId, army] of Object.entries(armiesById)) {
      expect(danglingReferences(army), armyId).toEqual([]);
    }
  });

  it('every magic item constraint references an existing magic item', () => {
    const itemIds = new Set(Object.keys(magicItems.upgrades));
    const constrained = magicItems.upgradeConstraints.flatMap((constraint) => constraint.upgrades);

    expect(constrained.filter((id) => !itemIds.has(id))).toEqual([]);
  });
});
