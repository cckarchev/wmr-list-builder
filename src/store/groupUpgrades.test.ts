import { describe, it, expect } from 'vitest';
import { groupUpgradeIds } from './groupUpgrades';
import type { UpgradeState } from './storeHelpers';

/** Build a minimal upgrades map keyed in insertion order; only `type` matters here. */
function upgradesOf(entries: [string, string][]): Record<string, UpgradeState> {
  const map: Record<string, UpgradeState> = {};
  for (const [id, type] of entries) {
    map[id] = { type } as UpgradeState;
  }
  return map;
}

describe('groupUpgradeIds', () => {
  it('collapses the several mount types into one "Mounts" group', () => {
    const upgrades = upgradesOf([
      ['Wolf Chariot', 'Chariot Mount'],
      ['Wyvern', 'Monstrous Mount'],
      ['War Boar', 'Special Mount'],
    ]);
    const groups = groupUpgradeIds(['Wolf Chariot', 'Wyvern', 'War Boar'], upgrades);
    expect(groups).toEqual([
      { label: 'Mounts', upgradeIds: ['Wolf Chariot', 'Wyvern', 'War Boar'] },
    ]);
  });

  it('keeps magic-item subtypes and troop attachments as distinct groups', () => {
    const upgrades = upgradesOf([
      ['Battle Banner', 'Magic Standard'],
      ['Sword of Might', 'Magic Weapon'],
      ['Squig Herd', 'Infantry'],
    ]);
    const groups = groupUpgradeIds(['Battle Banner', 'Sword of Might', 'Squig Herd'], upgrades);
    expect(groups.map((g) => g.label)).toEqual(['Magic Standard', 'Magic Weapon', 'Infantry']);
  });

  it('orders categories by first appearance and preserves id order within each', () => {
    const upgrades = upgradesOf([
      ['Wyvern', 'Monstrous Mount'],
      ['Battle Banner', 'Magic Standard'],
      ['Wolf Chariot', 'Chariot Mount'],
    ]);
    const groups = groupUpgradeIds(['Wyvern', 'Battle Banner', 'Wolf Chariot'], upgrades);
    expect(groups).toEqual([
      { label: 'Mounts', upgradeIds: ['Wyvern', 'Wolf Chariot'] },
      { label: 'Magic Standard', upgradeIds: ['Battle Banner'] },
    ]);
  });

  it('skips ids missing from the upgrades map', () => {
    const upgrades = upgradesOf([['Wyvern', 'Monstrous Mount']]);
    const groups = groupUpgradeIds(['Wyvern', 'Ghost'], upgrades);
    expect(groups).toEqual([{ label: 'Mounts', upgradeIds: ['Wyvern'] }]);
  });
});
