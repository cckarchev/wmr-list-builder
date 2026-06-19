import type { SpecialRule } from '../data/types';
import type { UnitState } from './storeHelpers';

export interface ResolvedRule {
  name: string;
  rule: SpecialRule;
}

/**
 * Resolve the special rules that apply to a single unit: the rule named after
 * the unit itself (if any) plus each entry in its `specialRules`, de-duplicated
 * and ordered by `rule.order`. Shared by the Build screen and the Print view.
 */
export function resolveUnitSpecialRules(
  unitId: string,
  unit: Pick<UnitState, 'specialRules'>,
  allRules: Record<string, SpecialRule> | undefined,
): ResolvedRule[] {
  if (!allRules) return [];

  const names: string[] = [];
  const add = (name: string) => {
    if (allRules[name] && !names.includes(name)) names.push(name);
  };

  add(unitId);
  unit.specialRules?.forEach(add);

  return names
    .map((name) => ({ name, rule: allRules[name] }))
    .sort((a, b) => (a.rule.order ?? 0) - (b.rule.order ?? 0));
}
