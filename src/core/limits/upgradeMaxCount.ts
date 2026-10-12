interface UpgradeMaxCountInput {
  /** Stands in the unit: it can't take more of an upgrade than that. */
  stands: number;
  /** How many of the upgrade this unit already has. */
  taken: number;
  /** How many of the upgrade the whole army has, this unit included. */
  armyTotal: number;
  /** Army-wide cap, such as Magic Standards at 1 per army, if the upgrade has one. */
  armyMax?: number;
  /**
   * Other upgrades of the same kind the unit carries, such as its other magic
   * items: the unit has one slot per stand for the whole kind.
   */
  sameKindTaken?: number;
}

/**
 * The most of an upgrade a unit may take. Other upgrades of its kind already
 * fill some of the unit's slots, and under an army-wide cap the rest of the
 * army's share is already spent, so only what remains of each is left.
 */
export const upgradeMaxCount = ({
  stands,
  taken,
  armyTotal,
  armyMax,
  sameKindTaken = 0,
}: UpgradeMaxCountInput): number => {
  const slotsLeft = Math.max(0, stands - sameKindTaken);

  if (armyMax === undefined) {
    return slotsLeft;
  }

  const usedElsewhere = armyTotal - taken;
  const armyAllowanceLeft = Math.max(0, armyMax - usedElsewhere);

  return Math.min(slotsLeft, armyAllowanceLeft);
};
