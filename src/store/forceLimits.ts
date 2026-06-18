import type { UnitState } from './storeHelpers';
import { unitPointsCost } from './storeHelpers';
import { armySize } from './selectors';

export interface Bounds {
  min: number;
  max?: number;
}

/** Fields the force-limit resolver reads off a unit. */
type Limited = Pick<UnitState, 'armyMin' | 'armyMax' | 'min' | 'max' | 'homologousUnits'>;

/**
 * Resolve a unit's HARD force limits at the given game-size cap.
 *
 * Absolute `armyMin`/`armyMax` always apply. Numeric, point-scaled `min`/`max`
 * are folded in too — resolved against the cap exactly as `validation.ts` does
 * (the per-1,000-points minimum only kicks in at caps >= 1,000; the maximum
 * uses `armySize`, which floors to 1). Keyword/relative rules ("elite",
 * "Half or None", "As X", …) and homologous units are left to soft validation,
 * since they can't be clamped per-unit without cross-unit context.
 */
export function resolveBounds(unit: Limited, gameSize: number): Bounds {
  let min = unit.armyMin ?? 0;
  let max = unit.armyMax;

  if (!unit.homologousUnits) {
    const size = armySize(gameSize);
    if (typeof unit.min === 'number' && gameSize >= 1000) {
      min = Math.max(min, unit.min * size);
    }
    if (typeof unit.max === 'number') {
      const scaledMax = unit.max * size;
      max = max === undefined ? scaledMax : Math.min(max, scaledMax);
    }
  }

  return { min, max };
}

/**
 * Auto-include every unit at its resolved minimum for `gameSize` (mutates and
 * returns `units`). Used at army init so mandatory and point-scaled-minimum
 * units start in the list. Game-size *changes* deliberately do NOT re-run this
 * — instead soft validation flags a now-invalid list for the user to correct.
 */
export function applyForceMinimums(
  units: Record<string, UnitState>,
  gameSize: number,
): Record<string, UnitState> {
  for (const id in units) {
    const unit = units[id];
    const { min } = resolveBounds(unit, gameSize);
    if (min > unit.number) {
      unit.number = min;
      unit.pointsCost = unitPointsCost(unit);
    }
  }
  return units;
}
