import type { SpecialRule } from '../data/types';
import type { UpgradeState } from './storeHelpers';
import type { ResolvedRule } from './specialRulesForUnit';

/**
 * Resolve the rule text shown for an upgrade. Upgrades carry rule text from two
 * sources: magic items embed it inline as `text` (titled by the upgrade's own
 * id), while army upgrades reference shared rules by name in `specialRules`
 * (resolved against the global `specialRules` map). Both are surfaced here,
 * de-duplicated by name and ordered by `rule.order`.
 */
export function resolveUpgradeRules(
  upgradeId: string,
  upgrade: Pick<UpgradeState, 'text' | 'specialRules'>,
  allRules: Record<string, SpecialRule> | undefined,
): ResolvedRule[] {
  const resolved: ResolvedRule[] = [];
  const names = new Set<string>();

  if (upgrade.text && upgrade.text.length > 0) {
    resolved.push({ name: upgradeId, rule: { text: upgrade.text } });
    names.add(upgradeId);
  }

  upgrade.specialRules?.forEach((name) => {
    if (allRules?.[name] && !names.has(name)) {
      resolved.push({ name, rule: allRules[name] });
      names.add(name);
    }
  });

  return resolved.sort((a, b) => (a.rule.order ?? 0) - (b.rule.order ?? 0));
}
