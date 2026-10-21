import { unitUpgradePointsCost } from "@/core/army-state/pricing";
import type {
  UnitState,
  UnitUpgradeEntry,
  UpgradeState,
} from "@/core/army-state/types";
import { clamp } from "@/core/lib/counts";

export type UnitUpgrades = Record<string, UnitUpgradeEntry>;

const emptyEntry = (): UnitUpgradeEntry => ({ number: 0, pointsCost: 0 });

/**
 * `addOnUpgrades` come and go with their upgrade: removed from the unit when
 * the upgrade drops to zero, added when it is first taken.
 */
const syncAddOns = (
  upgrade: UpgradeState,
  unitUpgrades: UnitUpgrades,
  number: number,
): void => {
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
 * Shared core of `setUnitUpgradeNumber` (actions.js). Mutates the
 * provided `unitUpgrades` map and the `upgrades` map (global totals) in place:
 * clamps `number` to [0, unit.number], syncs the add-on upgrades, moves the
 * global total by the delta and prices the unit's entry. The caller recomputes
 * the unit's overall pointsCost afterwards (mirroring the Vue
 * `skipSettingUnitPointsCost` flow).
 */
export const applyUnitUpgradeNumber = (
  upgrades: Record<string, UpgradeState>,
  unit: UnitState,
  unitUpgrades: UnitUpgrades,
  upgradeId: string,
  number: number,
): void => {
  const count = clamp(+number, 0, unit.number);
  const upgrade = { ...upgrades[upgradeId] };

  syncAddOns(upgrade, unitUpgrades, count);

  const previousUnitNumber = unitUpgrades[upgradeId]?.number ?? 0;

  upgrade.number = upgrade.number - previousUnitNumber + count;
  upgrades[upgradeId] = upgrade;

  unitUpgrades[upgradeId] = {
    number: count,
    pointsCost: unitUpgradePointsCost(upgrade, unit, count),
  };
};

/**
 * Lower any of the unit's upgrades taken more times than the unit now has
 * models, keeping the global upgrade totals in sync.
 */
export const capUnitUpgrades = (
  upgrades: Record<string, UpgradeState>,
  unit: UnitState,
): UnitUpgrades => {
  const unitUpgrades: UnitUpgrades = { ...unit.upgrades };

  for (const upgradeId of Object.keys(unitUpgrades)) {
    // Capping can remove add-ons that are still ahead in this loop.
    const taken = unitUpgrades[upgradeId]?.number ?? 0;

    if (taken > unit.number) {
      applyUnitUpgradeNumber(
        upgrades,
        unit,
        unitUpgrades,
        upgradeId,
        unit.number,
      );
    }
  }

  return unitUpgrades;
};
