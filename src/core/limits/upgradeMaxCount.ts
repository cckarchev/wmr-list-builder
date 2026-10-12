interface UpgradeMaxCountInput {
  /** Stands in the unit: it can't take more of an upgrade than that. */
  stands: number;
  /** How many of the upgrade this unit already has. */
  taken: number;
  /** How many of the upgrade the whole army has, this unit included. */
  armyTotal: number;
  /** Army-wide cap, such as Magic Standards at 1 per army, if the upgrade has one. */
  armyMax?: number;
}

/**
 * The most of an upgrade a unit may take. Under an army-wide cap, the rest of
 * the army's share is already spent, so only what remains of the cap is left.
 */
export const upgradeMaxCount = ({
  stands,
  taken,
  armyTotal,
  armyMax,
}: UpgradeMaxCountInput): number => {
  if (armyMax === undefined) {
    return stands;
  }

  const usedElsewhere = armyTotal - taken;
  const armyAllowanceLeft = Math.max(0, armyMax - usedElsewhere);

  return Math.min(stands, armyAllowanceLeft);
};
