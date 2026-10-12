import { describe, expect, it } from 'vitest';
import { armyIndex } from '@/data/armyIndex';
import { FACTION_ICON_PATHS, MIRRORED_FACTION_ICONS } from './factionIcons';

describe('faction icons', () => {
  it('has an icon for every army', () => {
    const missing = armyIndex.map(({ id }) => id).filter((id) => !(id in FACTION_ICON_PATHS));

    expect(missing).toEqual([]);
  });

  it('has no icon for an army that does not exist', () => {
    const armyIds = new Set(armyIndex.map(({ id }) => id));
    const orphans = Object.keys(FACTION_ICON_PATHS).filter((id) => !armyIds.has(id));

    expect(orphans).toEqual([]);
  });

  it('only mirrors armies that have an icon', () => {
    const unknown = [...MIRRORED_FACTION_ICONS].filter((id) => !(id in FACTION_ICON_PATHS));

    expect(unknown).toEqual([]);
  });
});
