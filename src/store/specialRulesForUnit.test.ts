import { describe, it, expect } from 'vitest';
import { resolveUnitSpecialRules } from './specialRulesForUnit';
import type { SpecialRule } from '../data/types';

const rules: Record<string, SpecialRule> = {
  Goblins: { order: 1, text: ['Goblins are cowardly.'] },
  'Bolt Thrower': { order: 0, text: ['Ignores armour.'] },
};

describe('resolveUnitSpecialRules', () => {
  it('includes the rule named after the unit', () => {
    const result = resolveUnitSpecialRules('Goblins', { specialRules: undefined }, rules);
    expect(result.map((r) => r.name)).toEqual(['Goblins']);
  });

  it('includes listed specialRules and sorts by order', () => {
    const result = resolveUnitSpecialRules(
      'Spear Chukka',
      { specialRules: ['Bolt Thrower'] },
      rules,
    );
    expect(result.map((r) => r.name)).toEqual(['Bolt Thrower']);
    expect(result[0].rule.text).toEqual(['Ignores armour.']);
  });

  it('de-duplicates and drops names absent from the rule map', () => {
    const result = resolveUnitSpecialRules('Goblins', { specialRules: ['Goblins', 'Nope'] }, rules);
    expect(result.map((r) => r.name)).toEqual(['Goblins']);
  });

  it('returns an empty array when there are no rules', () => {
    expect(resolveUnitSpecialRules('Squig Herd', { specialRules: undefined }, rules)).toEqual([]);
    expect(resolveUnitSpecialRules('Squig Herd', { specialRules: undefined }, undefined)).toEqual(
      [],
    );
  });
});
