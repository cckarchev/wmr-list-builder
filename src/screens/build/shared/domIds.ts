import { domSlug } from "@/core/lib/domSlug";

/**
 * Stable DOM id for a unit's card, so the points bar and the army summary can
 * scroll to it.
 */
export const unitDomId = (unitId: string): string =>
  `army-unit-${domSlug(unitId)}`;

/** DOM id of a roster group's collapsible card list. */
export const groupPanelId = (label: string): string =>
  `group-${domSlug(label)}`;

/** DOM id of a unit card's upgrades panel. */
export const upgradesPanelId = (unitId: string): string =>
  `upgrades-${domSlug(unitId)}`;
