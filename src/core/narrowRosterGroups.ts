import type { RosterGroup } from './selectors';

interface RosterNarrowing {
  /** Show only the group with this label, or every group when null. */
  activeType: string | null;
  /** Show only units with at least one model taken. */
  selectedOnly: boolean;
  /** How many of a unit are currently in the list. */
  countOf: (unitId: string) => number;
}

/** Apply the roster's type and selected-only filters, dropping empty groups. */
export const narrowRosterGroups = (
  groups: RosterGroup[],
  { activeType, selectedOnly, countOf }: RosterNarrowing,
): RosterGroup[] => {
  const matchesType = (group: RosterGroup) => activeType === null || group.label === activeType;
  const isSelected = (unitId: string) => countOf(unitId) > 0;

  const narrowUnits = (group: RosterGroup): RosterGroup => {
    if (!selectedOnly) {
      return group;
    }

    return { ...group, unitIds: group.unitIds.filter(isSelected) };
  };

  const hasUnits = (group: RosterGroup) => group.unitIds.length > 0;

  return groups.filter(matchesType).map(narrowUnits).filter(hasUnits);
};
