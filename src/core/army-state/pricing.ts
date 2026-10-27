import type { StatValue } from "@/data/types";
import { NO_STAT, type UnitState, type UpgradeState } from "./types";

/**
 * Port of `SET_UNIT_POINTS_COST` (mutations.js):
 * unit.number * +unit.points + Σ(its upgrades' pointsCost).
 */
export const unitPointsCost = (unit: UnitState): number => {
  const base = unit.number * +unit.points;

  if (!unit.upgrades) {
    return base;
  }

  return Object.values(unit.upgrades).reduce(
    (sum, u) => sum + u.pointsCost,
    base,
  );
};

/**
 * Minimal shape needed to price an upgrade, satisfied by army `Upgrade`,
 * `MagicItem`, and `UpgradeState`.
 */
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
  const isPriceTable = typeof points === "object";

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
 * (mutations.js), including variable pricing via `pointsValue`.
 */
export const unitUpgradePointsCost = (
  upgrade: UpgradeState,
  unit: UnitState,
  number: number,
): number => number * Number(resolveUpgradePoints(upgrade, unit));
