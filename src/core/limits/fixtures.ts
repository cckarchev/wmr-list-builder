import type { UnitUpgradeEntry, UpgradeState } from '@/core/army-state/types';

// Shared setup for the limits test files that build upgrades by type.

/** An upgrade of `type`, named after its id and not yet taken by any unit. */
export const upgradeOfType = (id: string, type: string): UpgradeState => ({
  id,
  name: id,
  type,
  number: 0,
});

/** A unit's entry for an upgrade it carries `number` of. */
export const taken = (number: number): UnitUpgradeEntry => ({ number, pointsCost: 0 });
