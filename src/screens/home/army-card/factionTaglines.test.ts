import { describe, expect, it } from 'vitest';
import { armyIndex } from '@/data/armyIndex';
import { FACTION_TAGLINES } from './factionTaglines';

describe('faction taglines', () => {
  it('has a tagline for every army', () => {
    const missing = armyIndex.map(({ id }) => id).filter((id) => !(id in FACTION_TAGLINES));

    expect(missing).toEqual([]);
  });

  it('has no tagline for an army that does not exist', () => {
    const armyIds = new Set(armyIndex.map(({ id }) => id));
    const orphans = Object.keys(FACTION_TAGLINES).filter((id) => !armyIds.has(id));

    expect(orphans).toEqual([]);
  });
});
