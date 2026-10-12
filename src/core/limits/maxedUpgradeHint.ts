import type { UnitState, UpgradeState } from '@/core/army-state/types';
import { kindFullHint } from './kindFullHint';
import { takenByHint } from './takenByHint';
import { armyAllowanceLeft } from './upgradeMaxCount';

interface MaxedUpgradeInput {
  units: Record<string, UnitState>;
  upgrades: Record<string, UpgradeState>;
  unitId: string;
  upgradeId: string;
}

/**
 * Why a unit can't take more of an upgrade, for the spent stepper: who has it
 * when the army-wide allowance ran out, such as a magic item another unit
 * already carries, or else that the unit has no room left for its kind.
 * Undefined when neither applies.
 */
export const maxedUpgradeHint = ({
  units,
  upgrades,
  unitId,
  upgradeId,
}: MaxedUpgradeInput): string | undefined => {
  const unit = units[unitId];
  const upgrade = upgrades[upgradeId];

  const allowanceLeft = armyAllowanceLeft({
    taken: unit.upgrades?.[upgradeId]?.number ?? 0,
    armyTotal: upgrade.number,
    armyMax: upgrade.armyMax,
  });

  const spentElsewhere = allowanceLeft === 0;

  if (spentElsewhere) {
    return takenByHint(units, upgradeId, unitId);
  }

  return kindFullHint({ carried: unit.upgrades, upgrades, upgradeId, stands: unit.number });
};
