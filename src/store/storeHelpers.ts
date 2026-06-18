import type { StatValue, Unit, Upgrade, MagicItem, UpgradeConstraint } from '../data/types';

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
 * (`StatValue` vs `string | Record<string,string>`) and `order`
 * (`number` vs `string | number`), and `MagicItem` carries `pointsValue` +
 * `text`. We model the reconciliation as a structural superset so a value of
 * either source type is assignable here, then add the live `number`/`minMax`
 * fields the Vue store attaches in `SET_UPGRADES`.
 */
export interface UpgradeState {
  order: string | number;
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
export function minMax(troop: Unit | Upgrade | MagicItem): string {
  const t = troop as {
    armyMin?: number;
    armyMax?: number;
    min?: number | string;
    max?: number | string;
  };

  if (t.armyMin || t.armyMax) {
    if (t.armyMin) {
      let result = String(t.armyMin);
      if (t.armyMax && t.armyMin !== t.armyMax) {
        result += '–' + t.armyMax;
      }
      return result;
    }
    return '0–' + t.armyMax;
  }

  if (typeof t.min === 'string' || typeof t.max === 'string') {
    return String(t.min || t.max);
  }

  return (t.min || '-') + '/' + (t.max || '-');
}

/**
 * Build the global upgrades map from army upgrades plus (when present)
 * magic-item upgrades, attaching the live `number`/`minMax` fields.
 * Port of `SET_UPGRADES` (mutations.js 135-144) combined with the
 * `Object.assign` merge from `initializeState` (actions.js 375).
 */
export function buildUpgrades(
  armyUpgrades: Record<string, Upgrade> | undefined,
  magicUpgrades: Record<string, MagicItem> | undefined,
): Record<string, UpgradeState> {
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
}

/**
 * Build the runtime units map from the army units plus the upgrade
 * constraints. Port of `SET_UNITS` (mutations.js 89-128) including the
 * upgradeConstraints auto-attach logic.
 */
export function buildUnits(
  armyUnits: Record<string, Unit>,
  upgradeConstraints: UpgradeConstraint[],
): Record<string, UnitState> {
  const result: Record<string, UnitState> = {};

  for (const unitID in armyUnits) {
    const source = armyUnits[unitID];
    // `noUpgrades` exists in some army data but is not in the Unit type.
    const noUpgrades = (source as { noUpgrades?: boolean }).noUpgrades;

    // start from the source upgrade-id array (if any)
    let upgradeIDs: string[] | undefined = source.upgrades
      ? [...source.upgrades]
      : undefined;

    for (const constraint of upgradeConstraints) {
      const c = constraint as {
        unitType: string[];
        unitArmour?: string[];
        unitHits?: (string | number)[];
        upgrades: string[];
        magic?: boolean;
      };

      if (
        c.unitType.includes(source.type) &&
        (c.unitArmour === undefined || c.unitArmour.includes(source.armour || '-')) &&
        (c.unitHits === undefined || c.unitHits.includes(source.hits ?? '-')) &&
        !noUpgrades &&
        !(source.noMagic && c.magic)
      ) {
        upgradeIDs = upgradeIDs ? upgradeIDs.concat(c.upgrades) : [...c.upgrades];
      }
    }

    const unit: UnitState = {
      ...(source as Omit<Unit, 'upgrades'>),
      number: 0,
      pointsCost: 0,
      minMax: minMax(source),
    };

    if (upgradeIDs) {
      unit.upgrades = upgradeIDs.reduce<Record<string, UnitUpgradeEntry>>((acc, id) => {
        acc[id] = { number: 0, pointsCost: 0 };
        return acc;
      }, {});
    }

    result[unitID] = unit;
  }

  return result;
}

/**
 * Port of `SET_UNIT_POINTS_COST` (mutations.js 63-74):
 * unit.number * +unit.points + Σ(its upgrades' pointsCost).
 */
export function unitPointsCost(unit: UnitState): number {
  const base = unit.number * +unit.points;
  if (!unit.upgrades) {
    return base;
  }
  return Object.values(unit.upgrades).reduce((sum, u) => sum + u.pointsCost, base);
}

/**
 * Port of the points calculation in `SET_UNIT_UPGRADE_NUMBER_AND_POINTS_COST`
 * (mutations.js 83-87), including variable pricing via `pointsValue`.
 */
export function unitUpgradePointsCost(
  upgrade: UpgradeState,
  unit: UnitState,
  number: number,
): number {
  if (upgrade.pointsValue !== undefined) {
    const points = upgrade.points as Record<string, string>;
    const lookup = (unit as unknown as Record<string, StatValue | undefined>)[upgrade.pointsValue] || '-';
    return number * +points[String(lookup)];
  }
  return number * +(upgrade.points as StatValue);
}
