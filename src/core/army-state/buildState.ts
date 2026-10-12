import type { MagicItem, Unit, Upgrade, UpgradeConstraint } from '@/data/types';
import { NO_STAT, type UnitState, type UnitUpgradeEntry, type UpgradeState } from './types';

/**
 * Build the global upgrades map from army upgrades plus (when present)
 * magic-item upgrades, attaching the live `number` field.
 * Port of `SET_UPGRADES` (mutations.js) combined with the
 * `Object.assign` merge from `initializeState` (actions.js).
 */
export const buildUpgrades = (
  armyUpgrades: Record<string, Upgrade> | undefined,
  magicUpgrades: Record<string, MagicItem> | undefined,
): Record<string, UpgradeState> => {
  const merged: Record<string, Upgrade | MagicItem> = { ...(armyUpgrades || {}) };

  if (magicUpgrades) {
    Object.assign(merged, magicUpgrades);
  }

  const result: Record<string, UpgradeState> = {};

  for (const id in merged) {
    const source = merged[id];

    result[id] = { ...source, number: 0 };
  }

  return result;
};

/**
 * Whether an army-wide upgrade constraint attaches its upgrades to a unit:
 * the unit's type, armour and hits must match, and magic constraints skip
 * units that cannot take magic items.
 */
export const constraintApplies = (unit: Unit, constraint: UpgradeConstraint): boolean => {
  if (unit.noMagic && constraint.magic) {
    return false;
  }

  const typeMatches = constraint.unitType.includes(unit.type);
  const armourMatches = constraint.unitArmour?.includes(unit.armour || NO_STAT) ?? true;
  const hitsMatch = constraint.unitHits?.includes(unit.hits ?? NO_STAT) ?? true;

  return typeMatches && armourMatches && hitsMatch;
};

/**
 * Build the runtime units map from the army units plus the upgrade
 * constraints. Port of `SET_UNITS` (mutations.js) including the
 * upgradeConstraints auto-attach logic.
 */
export const buildUnits = (
  armyUnits: Record<string, Unit>,
  upgradeConstraints: UpgradeConstraint[],
): Record<string, UnitState> => {
  const result: Record<string, UnitState> = {};

  for (const unitId in armyUnits) {
    const source = armyUnits[unitId];
    const attached = upgradeConstraints
      .filter((constraint) => constraintApplies(source, constraint))
      .flatMap((constraint) => constraint.upgrades);

    // A unit with neither its own upgrades nor attached ones gets no upgrades map.
    const hasUpgrades = source.upgrades !== undefined || attached.length > 0;
    const upgradeIds = hasUpgrades ? [...(source.upgrades ?? []), ...attached] : undefined;

    const unit: UnitState = {
      ...(source as Omit<Unit, 'upgrades'>),
      number: 0,
      pointsCost: 0,
    };

    if (upgradeIds) {
      unit.upgrades = upgradeIds.reduce<Record<string, UnitUpgradeEntry>>((acc, id) => {
        acc[id] = { number: 0, pointsCost: 0 };

        return acc;
      }, {});
    }

    result[unitId] = unit;
  }

  return result;
};
