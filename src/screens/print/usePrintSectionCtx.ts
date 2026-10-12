import { takenMagicItems } from '@/core/print/takenMagicItems';
import { collectUsedSpecialRules } from '@/core/special-rules/usedSpecialRules';
import { magicItems } from '@/data/magicItems';
import { useArmyStore } from '@/store/useArmyStore';
import type { PrintSectionCtx } from './sections/printSections';

/** Reads from the store which print sections have anything to show for the current list. */
export const usePrintSectionCtx = (): PrintSectionCtx => {
  const hasArmyRules = useArmyStore((s) => !!s.army?.armyRules);

  const hasSpecialRules = useArmyStore((s) => {
    if (!s.specialRules) {
      return false;
    }

    const usedRules = collectUsedSpecialRules(s.specialRules, s.units, s.upgrades);

    return Object.keys(usedRules).length > 0;
  });

  const hasMagicItems = useArmyStore((s) => {
    if (!s.magic) {
      return false;
    }

    return takenMagicItems(s.upgrades, magicItems.upgrades).length > 0;
  });

  const hasSpells = useArmyStore((s) => s.magic && (s.spells?.length ?? 0) > 0);

  return { hasArmyRules, hasSpecialRules, hasMagicItems, hasSpells };
};
