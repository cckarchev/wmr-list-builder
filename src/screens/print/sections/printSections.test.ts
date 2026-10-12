import { describe, expect, it } from 'vitest';
import { availablePrintSections, defaultSelectedIds, type PrintSectionCtx } from './printSections';

const NOTHING_TO_PRINT: PrintSectionCtx = {
  hasArmyRules: false,
  hasSpecialRules: false,
  hasMagicItems: false,
  hasSpells: false,
};

const idsFor = (ctx: Partial<PrintSectionCtx>) =>
  availablePrintSections({ ...NOTHING_TO_PRINT, ...ctx }).map((section) => section.id);

describe('availablePrintSections', () => {
  it('always includes Stats and Validation', () => {
    expect(idsFor({})).toEqual(['stats', 'validation']);
  });

  it('includes army rules, special rules, magic items and spells when each has content', () => {
    const ids = idsFor({
      hasArmyRules: true,
      hasSpecialRules: true,
      hasMagicItems: true,
      hasSpells: true,
    });

    expect(ids).toEqual([
      'stats',
      'armyRules',
      'specialRules',
      'magicItems',
      'spells',
      'validation',
    ]);
  });

  it('leaves out Magic Items when the list takes none, even for a magic army', () => {
    expect(idsFor({ hasSpecialRules: true, hasSpells: true })).toEqual([
      'stats',
      'specialRules',
      'spells',
      'validation',
    ]);
  });
});

describe('defaultSelectedIds', () => {
  it('selects every section but Validation, which starts off', () => {
    const sections = availablePrintSections({ ...NOTHING_TO_PRINT, hasSpells: true });

    expect([...defaultSelectedIds(sections)]).toEqual(['stats', 'spells']);
  });
});
