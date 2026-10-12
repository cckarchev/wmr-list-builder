/**
 * Coverage checks for a record keyed by army id, such as the faction icons or
 * taglines: which armies it misses, and which of its keys name no army.
 */
export const armyIdsMissingFrom = (
  record: Record<string, unknown>,
  armyIds: readonly string[],
): string[] => {
  return armyIds.filter((id) => !(id in record));
};

export const orphanArmyIds = (
  record: Record<string, unknown>,
  armyIds: readonly string[],
): string[] => {
  const knownIds = new Set(armyIds);

  return Object.keys(record).filter((id) => !knownIds.has(id));
};
