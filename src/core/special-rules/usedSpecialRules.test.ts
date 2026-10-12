import { describe, expect, it } from 'vitest';
import type { SpecialRule } from '@/data/types';
import { collectUsedSpecialRules } from './usedSpecialRules';

const rules: Record<string, SpecialRule> = {
  goblins: { id: 'goblins', name: 'Goblins', order: 1 },
  boltThrower: { id: 'boltThrower', name: 'Bolt Thrower', order: 0 },
  wolfChariot: { id: 'wolfChariot', name: 'Wolf Chariot' },
  orcShaman: { id: 'orcShaman', name: 'Orc Shaman' },
  waaagh: { id: 'waaagh', name: 'Waaagh!' },
};

describe('collectUsedSpecialRules', () => {
  it('collects the rules of taken units, by unit id and listed rules', () => {
    const units = {
      goblins: { number: 2, specialRules: undefined },
      spearChukka: { number: 1, specialRules: ['boltThrower'] },
    };

    const result = collectUsedSpecialRules(rules, units, {});

    expect(Object.keys(result).sort()).toEqual(['boltThrower', 'goblins']);
    expect(result.goblins).toBe(rules.goblins);
  });

  it('collects the rules of taken upgrades, by upgrade id and listed rules', () => {
    const upgrades = { wolfChariot: { number: 1, specialRules: ['waaagh'] } };

    const result = collectUsedSpecialRules(rules, {}, upgrades);

    expect(Object.keys(result).sort()).toEqual(['waaagh', 'wolfChariot']);
  });

  it('skips units and upgrades that are not taken', () => {
    const units = { goblins: { number: 0, specialRules: ['boltThrower'] } };
    const upgrades = { orcShaman: { number: 0, specialRules: ['waaagh'] } };

    expect(collectUsedSpecialRules(rules, units, upgrades)).toEqual({});
  });

  it('drops ids absent from the rule map', () => {
    const units = { squigHerd: { number: 1, specialRules: ['nope'] } };
    const upgrades = { trollBoss: { number: 1, specialRules: ['alsoNope'] } };

    expect(collectUsedSpecialRules(rules, units, upgrades)).toEqual({});
  });
});
