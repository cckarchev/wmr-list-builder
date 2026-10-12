import { Markdown } from '@/components/Markdown';
import { byRuleOrder } from '@/core/special-rules/ruleOrder';
import { collectUsedSpecialRules } from '@/core/special-rules/usedSpecialRules';
import type { SpecialRule } from '@/data/types';
import { useArmyStore } from '@/store/useArmyStore';
import {
  DefDesc,
  DefList,
  DefTerm,
  PrintHeading,
  PrintSection,
} from './print-section/PrintSection';

const byOrder = ([, a]: [string, SpecialRule], [, b]: [string, SpecialRule]) => byRuleOrder(a, b);

export const SpecialRules = () => {
  const allSpecialRules = useArmyStore((s) => s.specialRules);
  const units = useArmyStore((s) => s.units);
  const upgrades = useArmyStore((s) => s.upgrades);

  if (!allSpecialRules) {
    return null;
  }

  const usedRules = collectUsedSpecialRules(allSpecialRules, units, upgrades);
  const sorted = Object.entries(usedRules).sort(byOrder);

  if (sorted.length === 0) {
    return null;
  }

  return (
    <PrintSection>
      <PrintHeading>Special Rules</PrintHeading>
      <DefList>
        {sorted.flatMap(([id, rule]) => [
          <DefTerm key={`dt_${id}`}>
            {rule.order == null ? '' : `${rule.order}. `}
            {rule.name}
          </DefTerm>,
          <DefDesc key={`dd_${id}`}>
            <Markdown blocks={rule.text ?? []} />
          </DefDesc>,
        ])}
      </DefList>
    </PrintSection>
  );
};
