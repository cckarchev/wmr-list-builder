/**
 * Stable DOM id for a unit's row in the "Your Army" column, so the points bar
 * can scroll to the first offending unit when the list is invalid.
 */
export const unitDomId = (unitId: string): string => `army-unit-${unitId.replace(/\W+/g, '-')}`;
