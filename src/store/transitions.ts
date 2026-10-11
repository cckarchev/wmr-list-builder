import { unitPointsCost, unitUpgradePointsCost } from '@/core/army-state/pricing';
import type { UnitState, UnitUpgradeEntry, UpgradeState } from '@/core/army-state/types';
import { clamp, toCount } from '@/core/lib/counts';
import { resolveBounds } from '@/core/limits/forceLimits';
import type { ListSnapshot } from '@/core/persistence/snapshot';
import { validate } from '@/core/validation/validation';
import { type ArmyData, initializeState } from './armyData';

type UnitUpgrades = Record<string, UnitUpgradeEntry>;

/**
 * Pure state transitions behind the store's actions. Each takes the current
 * data and returns the fields that change, ready for zustand's `set`.
 */

const UNBOUNDED = { min: 0, max: undefined };

const emptyEntry = (): UnitUpgradeEntry => ({ number: 0, pointsCost: 0 });

/**
 * `addOnUpgrades` come and go with their upgrade: removed from the unit when
 * the upgrade drops to zero, added when it is first taken.
 */
const syncAddOns = (upgrade: UpgradeState, unitUpgrades: UnitUpgrades, number: number): void => {
  const addOns = upgrade.addOnUpgrades ?? [];

  if (number <= 0) {
    for (const addOnId of addOns) {
      delete unitUpgrades[addOnId];
    }

    return;
  }

  if (upgrade.number === 0) {
    for (const addOnId of addOns) {
      unitUpgrades[addOnId] = emptyEntry();
    }
  }
};

/**
 * Shared core of `setUnitUpgradeNumber` (actions.js 127-172). Mutates the
 * provided `unitUpgrades` map and the `upgrades` map (global totals) in place:
 * clamps `number` to [0, unit.number], syncs the add-on upgrades, moves the
 * global total by the delta and prices the unit's entry. The caller recomputes
 * the unit's overall pointsCost afterwards (mirroring the Vue
 * `skipSettingUnitPointsCost` flow).
 */
const applyUnitUpgradeNumber = (
  upgrades: Record<string, UpgradeState>,
  unit: UnitState,
  unitUpgrades: UnitUpgrades,
  upgradeId: string,
  number: number,
): void => {
  const n = clamp(+number, 0, unit.number);
  const upgrade = { ...upgrades[upgradeId] };

  syncAddOns(upgrade, unitUpgrades, n);

  const previousUnitNumber = unitUpgrades[upgradeId]?.number ?? 0;

  upgrade.number = upgrade.number - previousUnitNumber + n;
  upgrades[upgradeId] = upgrade;

  unitUpgrades[upgradeId] = {
    number: n,
    pointsCost: unitUpgradePointsCost(upgrade, unit, n),
  };
};

/**
 * Lower any of the unit's upgrades taken more times than the unit now has
 * models, keeping the global upgrade totals in sync.
 */
const capUnitUpgrades = (upgrades: Record<string, UpgradeState>, unit: UnitState): UnitUpgrades => {
  const unitUpgrades: UnitUpgrades = { ...unit.upgrades };

  for (const upgradeId of Object.keys(unitUpgrades)) {
    // Capping can remove add-ons that are still ahead in this loop.
    const taken = unitUpgrades[upgradeId]?.number ?? 0;

    if (taken > unit.number) {
      applyUnitUpgradeNumber(upgrades, unit, unitUpgrades, upgradeId, unit.number);
    }
  }

  return unitUpgrades;
};

export const withUnitNumber = (
  state: ArmyData,
  unitId: string,
  number: number,
): Partial<ArmyData> => {
  const units = { ...state.units };
  const upgrades = { ...state.upgrades };
  const existing = units[unitId];

  // clamp to the unit's resolved hard force limits at the current cap.
  const { min, max } = existing ? resolveBounds(existing, state.gameSize) : UNBOUNDED;
  const unit: UnitState = { ...existing, number: clamp(toCount(+number), min, max) };

  if (unit.upgrades) {
    unit.upgrades = capUnitUpgrades(upgrades, unit);
  }

  unit.pointsCost = unitPointsCost(unit);
  units[unitId] = unit;

  return { units, upgrades, errors: validate(units, upgrades, state.gameSize) };
};

export const withUnitUpgradeNumber = (
  state: ArmyData,
  unitId: string,
  upgradeId: string,
  number: number,
): Partial<ArmyData> => {
  const units = { ...state.units };
  const upgrades = { ...state.upgrades };
  const unit: UnitState = { ...units[unitId] };
  const unitUpgrades: UnitUpgrades = { ...unit.upgrades };

  applyUnitUpgradeNumber(upgrades, unit, unitUpgrades, upgradeId, number);

  unit.upgrades = unitUpgrades;
  unit.pointsCost = unitPointsCost(unit);
  units[unitId] = unit;

  return { units, upgrades, errors: validate(units, upgrades, state.gameSize) };
};

export const withGameSize = (state: ArmyData, size: number): Partial<ArmyData> => {
  const gameSize = toCount(Math.floor(+size));

  return { gameSize, errors: validate(state.units, state.upgrades, gameSize) };
};

const withSnapshotUnits = (state: ArmyData, snap: ListSnapshot): ArmyData => {
  let next = state;

  for (const [unitId, n] of Object.entries(snap.units)) {
    if (next.units[unitId]) {
      next = { ...next, ...withUnitNumber(next, unitId, n) };
    }
  }

  return next;
};

const withSnapshotUpgrades = (state: ArmyData, snap: ListSnapshot): ArmyData => {
  let next = state;

  for (const [unitId, unitUpgrades] of Object.entries(snap.upgrades)) {
    if (!next.units[unitId]) {
      continue;
    }

    const knownUpgrades = Object.entries(unitUpgrades).filter(([id]) => next.upgrades[id]);

    for (const [upgradeId, n] of knownUpgrades) {
      next = { ...next, ...withUnitUpgradeNumber(next, unitId, upgradeId, n) };
    }
  }

  return next;
};

/**
 * Load a saved or shared list. Starts from a clean baseline so selections from
 * a previously loaded list don't carry over into this one (the snapshot only
 * carries non-zero entries, so anything omitted must be reset, not left as-is).
 */
export const withList = (state: ArmyData, snap: ListSnapshot): Partial<ArmyData> => {
  const fresh = state.armyId ? initializeState(state.armyId) : state;
  const baseline: ArmyData = { ...state, units: fresh.units, upgrades: fresh.upgrades };
  const sized: ArmyData = {
    ...baseline,
    ...withGameSize(baseline, snap.gameSize),
    label: snap.name,
  };

  return withSnapshotUpgrades(withSnapshotUnits(sized, snap), snap);
};
