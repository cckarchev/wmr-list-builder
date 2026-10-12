import { countOf } from '@/core/lib/quantities';
import { countOfKind, kindOf, type SameKindInput } from './upgradeKinds';

interface KindFullInput extends SameKindInput {
  /** Stands in the unit: one slot per stand for each kind. */
  stands: number;
}

/**
 * Says the unit has no room left for another upgrade of `upgradeId`'s kind,
 * such as a 1-stand General that already carries a magic item, so the stepper
 * can explain why it is spent. Undefined while there is room, or for an
 * upgrade of no capped kind.
 */
export const kindFullHint = ({
  carried,
  upgrades,
  upgradeId,
  stands,
}: KindFullInput): string | undefined => {
  const kind = kindOf(upgrades[upgradeId].type);

  if (!kind) {
    return undefined;
  }

  const carriedOfKind = countOfKind(carried, upgrades, kind);

  if (carriedOfKind < stands) {
    return undefined;
  }

  return `Already carries ${countOf(carriedOfKind, kind.noun)}`;
};
