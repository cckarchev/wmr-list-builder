import type { UnitState } from '@/core/army-state/types';

const listFormat = new Intl.ListFormat('en', { type: 'conjunction' });

/**
 * Says which other units carry an upgrade, such as a magic item that only one
 * unit in the army may have, so the stepper can explain why it is spent.
 * Undefined when no other unit carries it.
 */
export const takenByHint = (
  units: Record<string, UnitState>,
  upgradeId: string,
  unitId: string,
): string | undefined => {
  const holders = Object.values(units).filter((unit) => {
    const count = unit.upgrades?.[upgradeId]?.number ?? 0;

    return unit.id !== unitId && count > 0;
  });

  if (holders.length === 0) {
    return undefined;
  }

  const names = holders.map((unit) => unit.name);

  return `Taken by ${listFormat.format(names)}`;
};
