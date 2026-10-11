/**
 * Pure state transitions behind the store's actions. Each takes the current
 * data and returns the fields that change, ready for zustand's `set`.
 */

import { unitPointsCost } from '@/core/army-state/pricing';
import type { UnitState } from '@/core/army-state/types';
import { clamp, toCount } from '@/core/lib/counts';
import { resolveBounds } from '@/core/limits/forceLimits';
import { validate } from '@/core/validation/validation';
import type { ArmyData } from '../armyData';
import { applyUnitUpgradeNumber, capUnitUpgrades, type UnitUpgrades } from './unitUpgrades';

const UNBOUNDED = { min: 0, max: undefined };

export const withUnitNumber = (
  state: ArmyData,
  unitId: string,
  number: number,
): Partial<ArmyData> => {
  const units = { ...state.units };
  const upgrades = { ...state.upgrades };
  const existing = units[unitId];

  // Clamp to the unit's resolved hard force limits at the current cap.
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
