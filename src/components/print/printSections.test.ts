import { describe, it, expect } from 'vitest';
import { availablePrintSections } from './printSections';

describe('availablePrintSections', () => {
  it('always includes Stats', () => {
    const ids = availablePrintSections({
      hasArmyRules: false,
      hasSpecialRules: false,
      magic: false,
    }).map((s) => s.id);
    expect(ids).toEqual(['stats']);
  });

  it('includes army rules, special rules, magic items and spells when available', () => {
    const ids = availablePrintSections({
      hasArmyRules: true,
      hasSpecialRules: true,
      magic: true,
    }).map((s) => s.id);
    expect(ids).toEqual(['stats', 'armyRules', 'specialRules', 'magicItems', 'spells']);
  });

  it('excludes magic items and spells for a non-magic army', () => {
    const ids = availablePrintSections({
      hasArmyRules: false,
      hasSpecialRules: true,
      magic: false,
    }).map((s) => s.id);
    expect(ids).toEqual(['stats', 'specialRules']);
  });
});
