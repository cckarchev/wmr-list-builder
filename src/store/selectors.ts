import type { ArmyState } from './useArmyStore';
import type { UnitState, UpgradeState, UnitUpgradeEntry } from './storeHelpers';
import type { ValidationError } from '../data/types';

const COUNTABLE_UNITS = [
  'Artillery',
  'Cavalry',
  'Chariot',
  'Elephant',
  'Infantry',
  'Machine',
  'Monster',
];

/** Port of getters.js `pointsCost`: Σ over units of unit.pointsCost. */
export function pointsCost(state: Pick<ArmyState, 'units'>): number {
  return Object.values(state.units).reduce((sum, unit) => sum + +unit.pointsCost, 0);
}

/** Port of getters.js `size`: Math.max(1, Math.floor(points / 1000)). */
export function armySize(points: number): number {
  return Math.max(1, Math.floor(points / 1000));
}

/** Port of getters.js `unitCount`, including the Skirmish logic. */
export function unitCount(units: Record<string, UnitState>): number {
  let skirmishCount = 0;
  let unarmouredSkirmishCount = 0;

  const count = Object.values(units).reduce((acc, unit) => {
    if (COUNTABLE_UNITS.includes(unit.type)) {
      if (!unit.noCount) {
        acc += unit.number;
      }

      if (unit.specialRules && unit.specialRules.includes('Skirmish')) {
        skirmishCount += unit.number;

        if (!unit.armour) {
          unarmouredSkirmishCount += unit.number;
        }
      }
    }

    return acc;
  }, 0);

  return skirmishCount > count - skirmishCount ? count : count - unarmouredSkirmishCount;
}

export type UsedUnit = Omit<UnitState, 'upgrades'> & {
  upgrades?: Record<string, UpgradeState & UnitUpgradeEntry>;
};

/** Port of getters.js `usedUnits`: units with number > 0, with used upgrades merged. */
export function usedUnits(state: Pick<ArmyState, 'units' | 'upgrades'>): Record<string, UsedUnit> {
  return Object.keys(state.units).reduce<Record<string, UsedUnit>>((acc, unitID) => {
    const unit = state.units[unitID];
    if (unit.number > 0) {
      const { upgrades, ...rest } = unit;
      const used: UsedUnit = { ...rest };

      if (upgrades) {
        used.upgrades = Object.keys(upgrades)
          .filter((upgradeID) => upgrades[upgradeID].number > 0)
          .reduce<Record<string, UpgradeState & UnitUpgradeEntry>>((upAcc, upgradeID) => {
            upAcc[upgradeID] = { ...state.upgrades[upgradeID], ...upgrades[upgradeID] };
            return upAcc;
          }, {});
      }

      acc[unitID] = used;
    }
    return acc;
  }, {});
}

/** Errors attributed to a given unit/upgrade id, for inline rendering. */
export function errorsForTarget(errors: ValidationError[], id: string): ValidationError[] {
  return errors.filter((e) => e.targets.includes(id));
}

/** List-level errors with no specific target (e.g. the points ceiling). */
export function globalErrors(errors: ValidationError[]): ValidationError[] {
  return errors.filter((e) => e.targets.length === 0);
}

/** Port of getters.js `usedUpgrades`: global upgrades with number > 0. */
export function usedUpgrades(state: Pick<ArmyState, 'upgrades'>): Record<string, UpgradeState> {
  return Object.keys(state.upgrades).reduce<Record<string, UpgradeState>>((acc, upgradeID) => {
    if (state.upgrades[upgradeID].number > 0) {
      acc[upgradeID] = { ...state.upgrades[upgradeID] };
    }
    return acc;
  }, {});
}
