import { Markdown } from '@/components/Markdown';
import type { UnitState, UpgradeState } from '@/core/army-state/types';
import { byRuleOrder } from '@/core/special-rules/ruleOrder';
import { resolveUnitSpecialRules } from '@/core/special-rules/specialRulesForUnit';
import type { SpecialRule } from '@/data/types';
import { useArmyStore } from '@/store/useArmyStore';
import {
  DefDesc,
  DefList,
  DefTerm,
  PrintHeading,
  PrintSection,
} from './print-section/PrintSection';

/** The rules that apply to any taken unit or upgrade, keyed by rule id. */
const collectUsedSpecialRules = (
  allSpecialRules: Record<string, SpecialRule>,
  units: Record<string, UnitState>,
  upgrades: Record<string, UpgradeState>,
): Record<string, SpecialRule> => {
  const result: Record<string, SpecialRule> = {};

  const addRule = (id: string) => {
    if (allSpecialRules[id]) {
      result[id] = allSpecialRules[id];
    }
  };

  for (const [unitId, unit] of Object.entries(units)) {
    if (unit.number > 0) {
      for (const { id } of resolveUnitSpecialRules(unitId, unit, allSpecialRules)) {
        addRule(id);
      }
    }
  }

  for (const [upgradeId, upgrade] of Object.entries(upgrades)) {
    if (upgrade.number > 0) {
      addRule(upgradeId);

      for (const id of upgrade.specialRules ?? []) {
        addRule(id);
      }
    }
  }

  return result;
};

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
