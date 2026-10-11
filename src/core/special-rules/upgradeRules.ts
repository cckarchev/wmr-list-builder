import type { SpecialRule } from '@/data/types';
import type { ResolvedRule } from './specialRulesForUnit';
import type { UpgradeState } from './storeHelpers';

/**
 * Resolve the rule text shown for an upgrade. Upgrades carry rule text from two
 * sources: magic items embed it inline as `text` (titled by the upgrade's own
 * name), while army upgrades reference shared rules by id in `specialRules`
 * (resolved against the army's `specialRules` map). Both are surfaced here,
 * de-duplicated by id and ordered by `rule.order`.
 */
export const resolveUpgradeRules = (
  upgradeId: string,
  upgrade: Pick<UpgradeState, 'name' | 'text' | 'specialRules'>,
  allRules: Record<string, SpecialRule> | undefined,
): ResolvedRule[] => {
  const resolved: ResolvedRule[] = [];
  const ids = new Set<string>();

  if (upgrade.text && upgrade.text.length > 0) {
    resolved.push({
      id: upgradeId,
      rule: { id: upgradeId, name: upgrade.name, text: upgrade.text },
    });
    ids.add(upgradeId);
  }

  for (const id of upgrade.specialRules ?? []) {
    if (allRules?.[id] && !ids.has(id)) {
      resolved.push({ id, rule: allRules[id] });
      ids.add(id);
    }
  }

  return resolved.sort((a, b) => (a.rule.order ?? 0) - (b.rule.order ?? 0));
};
