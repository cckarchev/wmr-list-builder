import { UNIT_TYPES } from '@/core/selectors';
import type { UpgradeState } from '@/core/storeHelpers';
import type { Rule, ValidatableItem } from './types';

/** Magic-item upgrade types (actions.js MAGIC_ITEM_TYPES). */
const MAGIC_ITEM_TYPES = [
  'Device of Power',
  'Magic Standard',
  'Magic Weapon',
  'Holy Item',
  'Other Item',
];

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

export const magicItemCap = upgradeCap('magic item', (type) => MAGIC_ITEM_TYPES.includes(type));

export const mountCap = upgradeCap('mount', (type) => type.endsWith('Mount'));

export const unitUpgradeCap = upgradeCap('upgrade', (type) => UNIT_TYPES.includes(type));
