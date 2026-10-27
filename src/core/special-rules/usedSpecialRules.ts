import type { UnitState, UpgradeState } from "@/core/army-state/types";
import type { SpecialRule } from "@/data/types";
import { resolveUnitSpecialRules } from "./specialRulesForUnit";

type TakenUnit = Pick<UnitState, "number" | "specialRules">;

type TakenUpgrade = Pick<UpgradeState, "number" | "specialRules">;

/** The rules that apply to any taken unit or upgrade, keyed by rule id. */
export const collectUsedSpecialRules = (
  allSpecialRules: Record<string, SpecialRule>,
  units: Record<string, TakenUnit>,
  upgrades: Record<string, TakenUpgrade>,
): Record<string, SpecialRule> => {
  const result: Record<string, SpecialRule> = {};

  const addRule = (id: string) => {
    if (allSpecialRules[id]) {
      result[id] = allSpecialRules[id];
    }
  };

  for (const [unitId, unit] of Object.entries(units)) {
    if (unit.number > 0) {
      for (const { id } of resolveUnitSpecialRules(
        unitId,
        unit,
        allSpecialRules,
      )) {
        addRule(id);
      }
    }
  }

  for (const [upgradeId, upgrade] of Object.entries(upgrades)) {
    if (upgrade.number > 0) {
      addRule(upgradeId);

      for (const id of upgrade.specialRules ?? []) {
        addRule(id);
      }
    }
  }

  return result;
};
