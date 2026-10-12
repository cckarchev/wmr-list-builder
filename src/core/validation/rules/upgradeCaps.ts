import type { UpgradeState } from '@/core/army-state/types';
import { UNIT_TYPES } from '@/core/army-state/unitTypes';
import { isMountType } from '@/core/army-state/upgradeTypes';
import { MAGIC_ITEM_TYPES } from '@/data/magicItems';
import type { Rule, ValidatableItem } from './types';

/** Sum the per-unit counts of `item`'s upgrades whose type matches `match`. */
const countUpgradesOfType = (
  item: ValidatableItem,
  upgrades: Record<string, UpgradeState>,
  match: (type: string) => boolean,
): number => {
  const entries = Object.entries(item.upgrades ?? {});
  const matching = entries.filter(([id]) => match(upgrades[id].type));

  return matching.reduce((count, [, entry]) => count + entry.number, 0);
};

/** An item cannot carry more upgrades of a kind than it has models. */
const upgradeCap =
  (noun: string, match: (type: string) => boolean): Rule =>
  ({ item, label, upgrades }) => {
    const carried = countUpgradesOfType(item, upgrades, match);

    if (item.number >= carried) {
      return undefined;
    }

    const plural = item.number > 1 ? 's' : '';

    return `${item.number} ${label} may only have ${item.number} ${noun}${plural}.`;
  };

export const magicItemCap = upgradeCap('magic item', (type) => MAGIC_ITEM_TYPES.has(type));

export const mountCap = upgradeCap('mount', isMountType);

export const unitUpgradeCap = upgradeCap('upgrade', (type) => UNIT_TYPES.includes(type));
