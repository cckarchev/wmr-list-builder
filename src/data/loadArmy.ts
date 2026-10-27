import { findArmy } from "./armyIndex";
import type { Army } from "./types";

export const loadArmy = (id: string): Army => {
  const army = findArmy(id);

  if (!army) {
    throw new Error(`Unknown army id: ${id}`);
  }

  if (!army.units || Object.keys(army.units).length === 0) {
    throw new Error(`Army ${id} has no units`);
  }

  return army;
};
