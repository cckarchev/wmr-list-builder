import { marked } from 'marked';
import { useArmyStore } from '../../store/useArmyStore';
import type { SpecialRule } from '../../data/types';
import { resolveUnitSpecialRules } from '../../store/specialRulesForUnit';
import { PrintSection, PrintHeading, DefList, DefTerm, DefDesc } from './printSection';

function collectUsedSpecialRules(
  allSpecialRules: Record<string, SpecialRule>,
  units: ReturnType<typeof useArmyStore.getState>['units'],
  upgrades: ReturnType<typeof useArmyStore.getState>['upgrades'],
): Record<string, SpecialRule> {
  const result: Record<string, SpecialRule> = {};

  const addRule = (name: string) => {
    if (allSpecialRules[name]) {
      result[name] = allSpecialRules[name];
    }
  };

  for (const [unitId, unit] of Object.entries(units)) {
    if (unit.number > 0) {
      for (const { name } of resolveUnitSpecialRules(unitId, unit, allSpecialRules)) {
        result[name] = allSpecialRules[name];
      }
    }
  }

  for (const [upgradeId, upgrade] of Object.entries(upgrades)) {
    if (upgrade.number > 0) {
      addRule(upgradeId);
      upgrade.specialRules?.forEach(addRule);
    }
  }

  return result;
}

export default function SpecialRules() {
  const specialRulesRaw = useArmyStore((s) => s.specialRules) as
    | Record<string, SpecialRule>
    | undefined;
  const units = useArmyStore((s) => s.units);
  const upgrades = useArmyStore((s) => s.upgrades);

  if (!specialRulesRaw) return null;

  const rulesMap = collectUsedSpecialRules(specialRulesRaw, units, upgrades);

  // sort by order
  const sorted = Object.entries(rulesMap).sort(([, a], [, b]) => {
    const ao = a.order ?? 0;
    const bo = b.order ?? 0;
    return ao < bo ? -1 : ao > bo ? 1 : 0;
  });

  if (sorted.length === 0) return null;

  return (
    <PrintSection>
      <PrintHeading>Special Rules</PrintHeading>
      <DefList>
        {sorted.flatMap(([name, rule]) => {
          const html = rule.text ? (marked(rule.text.join('\n\n')) as string) : '';
          return [
            <DefTerm key={`dt_${name}`}>
              {rule.order != null ? `${rule.order}. ` : ''}
              {name}
            </DefTerm>,
            <DefDesc key={`dd_${name}`} dangerouslySetInnerHTML={{ __html: html }} />,
          ];
        })}
      </DefList>
    </PrintSection>
  );
}
