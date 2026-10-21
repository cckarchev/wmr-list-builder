import type { ListSnapshot } from "@/core/persistence/snapshot";
import { type ArmyData, initializeState } from "../armyData";
import {
  withGameSize,
  withUnitNumber,
  withUnitUpgradeNumber,
} from "./transitions";

const withSnapshotUnits = (state: ArmyData, snap: ListSnapshot): ArmyData => {
  let next = state;

  for (const [unitId, count] of Object.entries(snap.units)) {
    if (next.units[unitId]) {
      next = { ...next, ...withUnitNumber(next, unitId, count) };
    }
  }

  return next;
};

const withSnapshotUpgrades = (
  state: ArmyData,
  snap: ListSnapshot,
): ArmyData => {
  let next = state;

  for (const [unitId, unitUpgrades] of Object.entries(snap.upgrades)) {
    if (!next.units[unitId]) {
      continue;
    }

    const knownUpgrades = Object.entries(unitUpgrades).filter(
      ([id]) => next.upgrades[id],
    );

    for (const [upgradeId, count] of knownUpgrades) {
      next = {
        ...next,
        ...withUnitUpgradeNumber(next, unitId, upgradeId, count),
      };
    }
  }

  return next;
};

/**
 * Load a saved or shared list. Starts from a clean baseline so selections from
 * a previously loaded list don't carry over into this one (the snapshot only
 * carries non-zero entries, so anything omitted must be reset, not left as-is).
 */
export const withList = (
  state: ArmyData,
  snap: ListSnapshot,
): Partial<ArmyData> => {
  const fresh = state.armyId ? initializeState(state.armyId) : state;
  const baseline: ArmyData = {
    ...state,
    units: fresh.units,
    upgrades: fresh.upgrades,
  };
  const sized: ArmyData = {
    ...baseline,
    ...withGameSize(baseline, snap.gameSize),
    label: snap.name,
  };
  const withUnits = withSnapshotUnits(sized, snap);

  return withSnapshotUpgrades(withUnits, snap);
};
