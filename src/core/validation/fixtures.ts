import type { UnitState, UpgradeState } from "@/core/army-state/types";
import { useArmyStore } from "@/store/useArmyStore";
import { validate } from "./validation";

// Shared setup for the validation test files, split by rule family.

/**
 * Names each synthetic item without a name after its key in upper case
 * (`a` becomes `A`, `u1` becomes `U1`), so messages can quote it.
 */
const named = <T extends { name: string }>(
  items: Record<string, T>,
): Record<string, T> => {
  const entries = Object.entries(items).map(([id, item]) => [
    id,
    { ...item, name: item.name || id.toUpperCase() },
  ]);

  return Object.fromEntries(entries);
};

export const validateNamed = (
  units: Record<string, UnitState>,
  upgrades: Record<string, UpgradeState>,
  gameSize: number,
) => validate(named(units), named(upgrades), gameSize);

export const get = () => useArmyStore.getState();

export const messages = () =>
  validateNamed(get().units, get().upgrades, get().gameSize).map(
    (e) => e.message,
  );

// Helpers for the keyword min/max + unit-upgrade-cap branches, which do NOT
// occur in any Warmaster Revolution army JSON (verified: every `min`/`max` in
// `src/data/armies/*.json` is numeric, and no unit carries 2+ unit-type
// upgrades). These build minimal state objects to exercise the ported logic.
export const unit = (partial: Partial<UnitState>): UnitState =>
  ({
    type: "Infantry",
    points: 100,
    number: 0,
    pointsCost: 0,
    ...partial,
  }) as UnitState;

export const upgrade = (partial: Partial<UpgradeState>): UpgradeState =>
  ({ type: "Infantry", number: 0, ...partial }) as UpgradeState;
