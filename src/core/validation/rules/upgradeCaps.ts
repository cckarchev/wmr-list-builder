import { countOf } from '@/core/lib/quantities';
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

    return `${item.number} ${label} may only have ${countOf(item.number, kind.noun)}.`;
  };

export const magicItemCap = upgradeCap(MAGIC_ITEM_KIND);

export const mountCap = upgradeCap(MOUNT_KIND);

export const unitUpgradeCap = upgradeCap(UNIT_UPGRADE_KIND);
