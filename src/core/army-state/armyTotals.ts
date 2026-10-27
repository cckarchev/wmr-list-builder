import { halfUp } from "@/core/lib/counts";
import type { ArmyPools, UnitState } from "./types";
import { UNIT_TYPES } from "./unitTypes";

/** Port of getters.js `pointsCost`: Σ over units of unit.pointsCost. */
export const pointsCost = (state: Pick<ArmyPools, "units">): number =>
  Object.values(state.units).reduce((sum, unit) => sum + +unit.pointsCost, 0);

/**
 * Units that count toward the break point: every countable type, except
 * `noCount` units.
 */
export const unitCount = (units: Record<string, UnitState>): number => {
  let count = 0;

  for (const unit of Object.values(units)) {
    const counts = UNIT_TYPES.includes(unit.type) && !unit.noCount;

    if (counts) {
      count += unit.number;
    }
  }

  return count;
};

/**
 * Units an army can lose before it must withdraw: half its countable units,
 * rounded up.
 */
export const breakPoint = (units: Record<string, UnitState>): number =>
  halfUp(unitCount(units));
