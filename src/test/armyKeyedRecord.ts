// Coverage checks for a record keyed by army id, such as the faction icons or
// taglines.

/** The armies the record has no entry for. */
export const armyIdsMissingFrom = (
  record: Record<string, unknown>,
  armyIds: readonly string[],
): string[] => armyIds.filter((id) => !Object.hasOwn(record, id));

/** The record's keys that name no army. */
export const orphanArmyIds = (
  record: Record<string, unknown>,
  armyIds: readonly string[],
): string[] => {
  const knownIds = new Set(armyIds);

  return Object.keys(record).filter((id) => !knownIds.has(id));
};
