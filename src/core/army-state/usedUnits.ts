import type { ArmyPools, UnitState, UnitUpgradeEntry, UpgradeState } from './types';

export type UsedUnit = Omit<UnitState, 'upgrades'> & {
  upgrades?: Record<string, UpgradeState & UnitUpgradeEntry>;
};

/** Port of getters.js `usedUnits`: units with number > 0, with used upgrades merged. */
export const usedUnits = (state: ArmyPools): Record<string, UsedUnit> =>
  Object.keys(state.units).reduce<Record<string, UsedUnit>>((acc, unitId) => {
    const unit = state.units[unitId];

    if (unit.number > 0) {
      const { upgrades, ...rest } = unit;
      const used: UsedUnit = { ...rest };

      if (upgrades) {
        used.upgrades = Object.keys(upgrades)
          .filter((upgradeId) => upgrades[upgradeId].number > 0)
          .reduce<Record<string, UpgradeState & UnitUpgradeEntry>>((upAcc, upgradeId) => {
            upAcc[upgradeId] = { ...state.upgrades[upgradeId], ...upgrades[upgradeId] };

            return upAcc;
          }, {});
      }

      acc[unitId] = used;
    }

    return acc;
  }, {});
