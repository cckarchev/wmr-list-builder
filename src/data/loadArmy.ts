import { armiesById } from './armyIndex';
import type { Army } from './types';

export function loadArmy(id: string): Army {
  const army = armiesById[id];
  if (!army) throw new Error(`Unknown army id: ${id}`);
  if (!army.units || Object.keys(army.units).length === 0) {
    throw new Error(`Army ${id} has no units`);
  }
  return army;
}
