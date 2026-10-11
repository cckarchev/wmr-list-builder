import type { MagicItem, StatValue, Unit, Upgrade, UpgradeConstraint } from '@/data/types';
import type { MinMaxSource } from './minMax';

/** Stat placeholder the army data uses for a missing value, e.g. no armour. */
const NO_STAT = '-';

/**
 * Runtime per-unit upgrade entry. Mirrors the Vue store's
 * `unit.upgrades[id] = { number, pointsCost }`.
 */
export interface UnitUpgradeEntry {
  number: number;
  pointsCost: number;
}

/**
 * Runtime unit. Same shape as the army `Unit` (minus the raw `upgrades`
 * string[] which the store converts into a keyed map) plus the live fields
 * the Vue store attaches in `SET_UNITS`: `number`, `pointsCost`, `minMax`.
 */
export interface UnitState extends Omit<Unit, 'upgrades'> {
  number: number;
  pointsCost: number;
  minMax?: string;
  upgrades?: Record<string, UnitUpgradeEntry>;
}

/**
 * Runtime upgrade in the GLOBAL `upgrades` map. This must accommodate both
 * army `Upgrade` records AND magic-item `MagicItem` records, because when an
 * army has `magic: true` the magic-item upgrades are merged into the same map
 * (see `initializeState`). The two source types differ on `points`
 * (`StatValue` vs `string | Record<string,string>`), and `MagicItem` carries
 * `pointsValue` + `text`. We model the reconciliation as a structural superset
 * so a value of either source type is assignable here, then add the live
 * `number`/`minMax` fields the Vue store attaches in `SET_UPGRADES`.
 */
export interface UpgradeState {
  name: string;
  id?: number;
  type: string;
  points?: StatValue | Record<string, string>;
  pointsValue?: string;
  attack?: StatValue;
  hits?: StatValue;
  size?: number;
  min?: number | string;
  max?: number | string;
  armyMin?: number;
  armyMax?: number;
  range?: string;
  specialRules?: string[];
  addOnUpgrades?: string[];
  homologousUpgrades?: string[];
  requiredUpgrades?: string[];
  prohibitedUpgrades?: string[];
  requiredUnits?: string[];
  prohibitedUnits?: string[];
  text?: string[];
  // live fields attached by the store
  number: number;
  minMax?: string;
}

/**
 * Port of the `minMax` helper in mutations.js (150-172). Operates on either a
 * unit or an upgrade source record.
 */
export const minMax = (troop: Unit | Upgrade | MagicItem): string => {
  const { armyMin, armyMax, min, max } = troop as MinMaxSource;

  if (armyMin) {
    const hasRange = Boolean(armyMax) && armyMax !== armyMin;

    return hasRange ? `${armyMin}–${armyMax}` : String(armyMin);
  }

  if (armyMax) {
    return `0–${armyMax}`;
  }

  if (typeof min === 'string' || typeof max === 'string') {
    return String(min || max);
  }

  return `${min || NO_STAT}/${max || NO_STAT}`;
};

/**
 * Build the global upgrades map from army upgrades plus (when present)
 * magic-item upgrades, attaching the live `number`/`minMax` fields.
 * Port of `SET_UPGRADES` (mutations.js 135-144) combined with the
 * `Object.assign` merge from `initializeState` (actions.js 375).
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

    result[id] = {
      ...(source as UpgradeState),
      number: 0,
      minMax: minMax(source),
    };
  }

  return result;
};

/**
 * Whether an army-wide upgrade constraint attaches its upgrades to a unit:
 * the unit's type, armour and hits must match, it must not opt out of
 * upgrades, and magic constraints skip units that cannot take magic items.
 */
export const constraintApplies = (unit: Unit, constraint: UpgradeConstraint): boolean => {
  // `noUpgrades` exists in some army data but is not in the Unit type.
  const noUpgrades = (unit as { noUpgrades?: boolean }).noUpgrades;

  if (noUpgrades) {
    return false;
  }

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
 * constraints. Port of `SET_UNITS` (mutations.js 89-128) including the
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
      minMax: minMax(source),
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

/**
 * Port of `SET_UNIT_POINTS_COST` (mutations.js 63-74):
 * unit.number * +unit.points + Σ(its upgrades' pointsCost).
 */
export const unitPointsCost = (unit: UnitState): number => {
  const base = unit.number * +unit.points;

  if (!unit.upgrades) {
    return base;
  }

  return Object.values(unit.upgrades).reduce((sum, u) => sum + u.pointsCost, base);
};

/** Minimal shape needed to price an upgrade, satisfied by army `Upgrade`, `MagicItem`, and `UpgradeState`. */
interface PricedUpgrade {
  points?: StatValue | Record<string, string>;
  pointsValue?: string;
}

/**
 * Read a data-driven stat field off a unit. The key comes from
 * `upgrade.pointsValue` at runtime, so this dynamic index is the single,
 * localized spot where we step outside the static unit shape.
 */
const unitStat = (unit: object, key: string): StatValue | undefined =>
  (unit as Record<string, StatValue | undefined>)[key];

/**
 * Resolve the per-item points price of an upgrade for a unit, handling variable
 * pricing: when `pointsValue` is set, `points` is a map keyed by the unit's
 * value for that stat. Returns undefined when the price can't be resolved
 * (missing map entry, or a variable upgrade with no unit context).
 */
export const resolveUpgradePoints = (
  upgrade: PricedUpgrade,
  unit?: object,
): StatValue | undefined => {
  const { points, pointsValue } = upgrade;
  const isPriceTable = typeof points === 'object';

  if (pointsValue === undefined) {
    return isPriceTable ? undefined : points;
  }

  if (!unit || !isPriceTable) {
    return undefined;
  }

  const key = String(unitStat(unit, pointsValue) ?? NO_STAT);

  return points[key];
};

/**
 * Port of the points calculation in `SET_UNIT_UPGRADE_NUMBER_AND_POINTS_COST`
 * (mutations.js 83-87), including variable pricing via `pointsValue`.
 */
export const unitUpgradePointsCost = (
  upgrade: UpgradeState,
  unit: UnitState,
  number: number,
): number => number * Number(resolveUpgradePoints(upgrade, unit));
