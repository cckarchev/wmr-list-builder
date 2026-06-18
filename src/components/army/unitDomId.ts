/**
 * Stable DOM id for a unit's row in the "Your Army" column, so the points bar
 * can scroll to the first offending unit when the list is invalid.
 */
export function unitDomId(unitId: string): string {
  return `army-unit-${unitId.replace(/\W+/g, '-')}`;
}
