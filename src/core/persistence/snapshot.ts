import type { ArmyPools } from '@/core/army-state/types';

/** A list reduced to what is worth storing: its name, game size and chosen counts. */
export interface ListSnapshot {
  name: string;
  gameSize: number;
  units: Record<string, number>;
  upgrades: Record<string, Record<string, number>>;
}

export const snapshotOf = (
  state: Pick<ArmyPools, 'units'> & { gameSize: number; label: string },
): ListSnapshot => {
  const units: Record<string, number> = {};
  const upgrades: Record<string, Record<string, number>> = {};

  for (const [id, unit] of Object.entries(state.units)) {
    if (unit.number > 0) {
      units[id] = unit.number;
    }

    for (const [upgradeId, upgrade] of Object.entries(unit.upgrades ?? {})) {
      if (upgrade.number > 0) {
        upgrades[id] ??= {};
        upgrades[id][upgradeId] = upgrade.number;
      }
    }
  }

  return { name: state.label, gameSize: state.gameSize, units, upgrades };
};
