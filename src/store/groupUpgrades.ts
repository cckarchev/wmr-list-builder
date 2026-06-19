import type { UpgradeState } from './storeHelpers';

export interface UpgradeGroup {
  label: string;
  upgradeIds: string[];
}

/**
 * Collapse an upgrade's `type` into a display category. The several mount types
 * (Monstrous/Chariot/Special Mount) read better as a single "Mounts" group;
 * every other type (magic-item subtypes, troop attachments) keeps its own
 * label so the distinctions the data draws are preserved.
 */
function categoryOf(type: string): string {
  return /Mount$/.test(type) ? 'Mounts' : type;
}

/**
 * Bucket a unit's available upgrade ids into ordered category groups. Category
 * order follows each category's first appearance in `upgradeIds`, and ids keep
 * their original order within a category — so the grouping only reorganizes,
 * never reshuffles. Upgrades missing from `upgrades` are skipped.
 */
export function groupUpgradeIds(
  upgradeIds: string[],
  upgrades: Record<string, UpgradeState>,
): UpgradeGroup[] {
  const groups = new Map<string, string[]>();
  for (const id of upgradeIds) {
    const upgrade = upgrades[id];
    if (!upgrade) continue;
    const label = categoryOf(upgrade.type);
    const bucket = groups.get(label);
    if (bucket) bucket.push(id);
    else groups.set(label, [id]);
  }
  return [...groups].map(([label, ids]) => ({ label, upgradeIds: ids }));
}
