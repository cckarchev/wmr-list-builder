import type { UnitState } from '@/core/army-state/types';
import type { SpecialRule } from '@/data/types';

export interface ResolvedRule {
  id: string;
  rule: SpecialRule;
}

/**
 * Resolve the special rules that apply to a single unit: the rule keyed by the
 * unit's own id (if any) plus each entry in its `specialRules`, de-duplicated
 * and ordered by `rule.order`. Shared by the Build screen and the Print view.
 */
export const resolveUnitSpecialRules = (
  unitId: string,
  unit: Pick<UnitState, 'specialRules'>,
  allRules: Record<string, SpecialRule> | undefined,
): ResolvedRule[] => {
  if (!allRules) {
    return [];
  }

  const candidates = [unitId, ...(unit.specialRules ?? [])];
  const ids = [...new Set(candidates)].filter((id) => allRules[id]);

  return ids
    .map((id) => ({ id, rule: allRules[id] }))
    .sort((a, b) => (a.rule.order ?? 0) - (b.rule.order ?? 0));
};
