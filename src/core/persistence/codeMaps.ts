import { loadArmy } from "@/data/loadArmy";
import { magicItems } from "@/data/magicItems";
import type { Army } from "@/data/types";

export interface ArmyCodeMaps {
  unitCodeById: Map<string, number>;
  unitIdByCode: Map<number, string>;
  upgradeCodeById: Map<string, number>;
  upgradeIdByCode: Map<number, string>;
}

/**
 * Build id<->code lookups for a single army. Upgrade lookups include the army's
 * own upgrades plus the shared magic items (codes from MAGIC_ITEM_CODE_MIN up);
 * unselected entries simply never appear in an encoded list, so including all
 * of them is harmless.
 */
export const buildCodeMaps = (army: Army): ArmyCodeMaps => {
  const unitCodeById = new Map<string, number>();
  const unitIdByCode = new Map<number, string>();

  for (const [id, unit] of Object.entries(army.units)) {
    unitCodeById.set(id, unit.code);
    unitIdByCode.set(unit.code, id);
  }

  const upgradeCodeById = new Map<string, number>();
  const upgradeIdByCode = new Map<number, string>();
  const upgradeSources = [
    ...Object.entries(army.upgrades ?? {}),
    ...Object.entries(magicItems.upgrades),
  ];

  for (const [id, upgrade] of upgradeSources) {
    upgradeCodeById.set(id, upgrade.code);
    upgradeIdByCode.set(upgrade.code, id);
  }

  return { unitCodeById, unitIdByCode, upgradeCodeById, upgradeIdByCode };
};

/** The code maps of the army with this id. Throws for an unknown army. */
export const codeMapsFor = (armyId: string): ArmyCodeMaps =>
  buildCodeMaps(loadArmy(armyId));
