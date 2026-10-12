import type { UpgradeState } from '@/core/army-state/types';
import { MAGIC_ITEM_TYPES } from '@/data/magicItems';

type TakenUpgrade = Pick<UpgradeState, 'number' | 'type'>;

/** The magic items in `catalog` that the list takes at least once, in catalog order. */
export const takenMagicItems = <Item>(
  upgrades: Record<string, TakenUpgrade>,
  catalog: Record<string, Item>,
): [string, Item][] => {
  const isTaken = (id: string) => {
    const upgrade = upgrades[id];

    if (!upgrade) {
      return false;
    }

    return upgrade.number > 0 && MAGIC_ITEM_TYPES.has(upgrade.type);
  };

  return Object.entries(catalog).filter(([id]) => isTaken(id));
};
