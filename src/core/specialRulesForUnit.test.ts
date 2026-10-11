import { describe, expect, it } from 'vitest';
import type { SpecialRule } from '@/data/types';
import { resolveUnitSpecialRules } from './specialRulesForUnit';

const rules: Record<string, SpecialRule> = {
  goblins: { name: 'Goblins', order: 1, text: ['Goblins are cowardly.'] },
  boltThrower: { name: 'Bolt Thrower', order: 0, text: ['Ignores armour.'] },
};

describe('resolveUnitSpecialRules', () => {
  it('includes the rule keyed by the unit id', () => {
    const result = resolveUnitSpecialRules('goblins', { specialRules: undefined }, rules);

    expect(result).toEqual([{ id: 'goblins', rule: rules.goblins }]);
  });

  it('includes listed specialRules and sorts by order', () => {
    const result = resolveUnitSpecialRules('spearChukka', { specialRules: ['boltThrower'] }, rules);

    expect(result.map((r) => r.id)).toEqual(['boltThrower']);
    expect(result[0].rule.name).toBe('Bolt Thrower');
  });

  it('de-duplicates and drops ids absent from the rule map', () => {
    const result = resolveUnitSpecialRules('goblins', { specialRules: ['goblins', 'nope'] }, rules);

    expect(result.map((r) => r.id)).toEqual(['goblins']);
  });

  it('returns an empty array when there are no rules', () => {
    expect(resolveUnitSpecialRules('squigHerd', { specialRules: undefined }, rules)).toEqual([]);
    expect(resolveUnitSpecialRules('squigHerd', { specialRules: undefined }, undefined)).toEqual(
      [],
    );
  });
});
