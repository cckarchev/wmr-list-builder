import type { UnitUpgradeEntry, UpgradeState } from '@/core/army-state/types';
import { UNIT_TYPES } from '@/core/army-state/unitTypes';
import { isMountType } from '@/core/army-state/upgradeTypes';
import { MAGIC_ITEM_TYPES } from '@/data/magicItems';

/**
 * A kind of upgrade a unit may carry at most one of per model, whatever the
 * upgrade: magic items, mounts and unit upgrades.
 */
export interface UpgradeKind {
  /** How a validation message names one of the kind. */
  noun: string;
  matches: (type: string) => boolean;
}

export const MAGIC_ITEM_KIND: UpgradeKind = {
  noun: 'magic item',
  matches: (type) => MAGIC_ITEM_TYPES.has(type),
};

export const MOUNT_KIND: UpgradeKind = {
  noun: 'mount',
  matches: isMountType,
};

export const UNIT_UPGRADE_KIND: UpgradeKind = {
  noun: 'upgrade',
  matches: (type) => UNIT_TYPES.includes(type),
};

const CAPPED_KINDS = [MAGIC_ITEM_KIND, MOUNT_KIND, UNIT_UPGRADE_KIND];

/** The capped kind an upgrade type belongs to, if any. */
export const kindOf = (type: string): UpgradeKind | undefined =>
  CAPPED_KINDS.find((kind) => kind.matches(type));

type CarriedUpgrades = Record<string, UnitUpgradeEntry> | undefined;

/** Sum the carried counts of the upgrades of `kind`. */
export const countOfKind = (
  carried: CarriedUpgrades,
  upgrades: Record<string, UpgradeState>,
  kind: UpgradeKind,
): number => {
  const entries = Object.entries(carried ?? {});
  const matching = entries.filter(([id]) => kind.matches(upgrades[id].type));

  return matching.reduce((count, [, entry]) => count + entry.number, 0);
};

export interface SameKindInput {
  /** The unit's upgrades, keyed by id. */
  carried: CarriedUpgrades;
  upgrades: Record<string, UpgradeState>;
  upgradeId: string;
}

/**
 * How many other upgrades of `upgradeId`'s kind the unit already carries: each
 * takes up one of the unit's per-model slots for that kind. Zero for an
 * upgrade of no capped kind.
 */
export const sameKindTakenAlongside = ({ carried, upgrades, upgradeId }: SameKindInput): number => {
  const kind = kindOf(upgrades[upgradeId].type);

  if (!kind) {
    return 0;
  }

  const ownCount = carried?.[upgradeId]?.number ?? 0;

  return countOfKind(carried, upgrades, kind) - ownCount;
};
