import {
  countOfKind,
  MAGIC_ITEM_KIND,
  MOUNT_KIND,
  UNIT_UPGRADE_KIND,
  type UpgradeKind,
} from '@/core/limits/upgradeKinds';
import type { Rule } from './types';

/** An item cannot carry more upgrades of a kind than it has models. */
const upgradeCap =
  (kind: UpgradeKind): Rule =>
  ({ item, label, upgrades }) => {
    const carried = countOfKind(item.upgrades, upgrades, kind);

    if (item.number >= carried) {
      return undefined;
    }

    const plural = item.number > 1 ? 's' : '';

    return `${item.number} ${label} may only have ${item.number} ${kind.noun}${plural}.`;
  };

export const magicItemCap = upgradeCap(MAGIC_ITEM_KIND);

export const mountCap = upgradeCap(MOUNT_KIND);

export const unitUpgradeCap = upgradeCap(UNIT_UPGRADE_KIND);
