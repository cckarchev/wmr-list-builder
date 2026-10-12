interface ArmyAllowanceInput {
  /** How many of the upgrade this unit already has. */
  taken: number;
  /** How many of the upgrade the whole army has, this unit included. */
  armyTotal: number;
  /** Army-wide cap, such as Magic Standards at 1 per army, if the upgrade has one. */
  armyMax?: number;
}

interface UpgradeMaxCountInput extends ArmyAllowanceInput {
  /** Stands in the unit: it can't take more of an upgrade than that. */
  stands: number;
  /**
   * Other upgrades of the same kind the unit carries, such as its other magic
   * items: the unit has one slot per stand for the whole kind.
   */
  sameKindTaken?: number;
}

/**
 * How much of an army-wide cap is still open to this unit: the cap minus what
 * the rest of the army already spent, this unit's own share counting as open.
 * Undefined for an upgrade with no army-wide cap.
 */
export const armyAllowanceLeft = ({
  taken,
  armyTotal,
  armyMax,
}: ArmyAllowanceInput): number | undefined => {
  if (armyMax === undefined) {
    return undefined;
  }

  const usedElsewhere = armyTotal - taken;

  return Math.max(0, armyMax - usedElsewhere);
};

/**
 * The most of an upgrade a unit may take. Other upgrades of its kind already
 * fill some of the unit's slots, and under an army-wide cap the rest of the
 * army's share is already spent, so only what remains of each is left.
 */
export const upgradeMaxCount = ({
  stands,
  sameKindTaken = 0,
  ...army
}: UpgradeMaxCountInput): number => {
  const slotsLeft = Math.max(0, stands - sameKindTaken);
  const allowanceLeft = armyAllowanceLeft(army);

  if (allowanceLeft === undefined) {
    return slotsLeft;
  }

  return Math.min(slotsLeft, allowanceLeft);
};
