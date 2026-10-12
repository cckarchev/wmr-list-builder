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

/** A unit takes at most one of any upgrade per stand. */
const STAND_LIMIT_HINT = 'Max 1 per stand';

/**
 * Why a unit can't take more of an upgrade, for the spent stepper, checking
 * each limit from the most specific: who has it when other units spent the
 * army-wide allowance, that the unit has no room left for its kind, that the
 * unit holds the whole army-wide allowance itself, or that it has one per
 * stand. Undefined while the unit can still take more.
 */
export const maxedUpgradeHint = ({
  units,
  upgrades,
  unitId,
  upgradeId,
}: MaxedUpgradeInput): string | undefined => {
  const unit = units[unitId];
  const upgrade = upgrades[upgradeId];
  const taken = unit.upgrades?.[upgradeId]?.number ?? 0;

  const allowanceLeft = armyAllowanceLeft({
    taken,
    armyTotal: upgrade.number,
    armyMax: upgrade.armyMax,
  });

  const spentElsewhere = allowanceLeft === 0;

  if (spentElsewhere) {
    return takenByHint(units, upgradeId, unitId);
  }

  const kindFull = kindFullHint({
    carried: unit.upgrades,
    upgrades,
    upgradeId,
    stands: unit.number,
  });

  if (kindFull !== undefined) {
    return kindFull;
  }

  const armyLimitReached = allowanceLeft !== undefined && taken >= allowanceLeft;

  if (armyLimitReached) {
    return `Max ${upgrade.armyMax} per army`;
  }

  const standLimitReached = taken >= unit.number;

  if (standLimitReached) {
    return STAND_LIMIT_HINT;
  }

  return undefined;
};
