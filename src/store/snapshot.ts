import type { ArmyState } from './useArmyStore';
import type { ListSnapshot } from './persistence';

export function snapshotOf(state: Pick<ArmyState, 'gameSize' | 'units' | 'label'>): ListSnapshot {
  const units: Record<string, number> = {};
  const upgrades: Record<string, Record<string, number>> = {};
  for (const [id, unit] of Object.entries(state.units)) {
    if (unit.number > 0) units[id] = unit.number;
    for (const [uId, u] of Object.entries(unit.upgrades ?? {})) {
      if (u.number > 0) {
        upgrades[id] ??= {};
        upgrades[id][uId] = u.number;
      }
    }
  }
  return { name: state.label, gameSize: state.gameSize, units, upgrades };
}
