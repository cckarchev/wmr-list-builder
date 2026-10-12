import { describe, expect, it } from 'vitest';
import { useArmyStore } from '@/store/useArmyStore';
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

describe('availablePrintSections with real army data', () => {
  it('exposes Empire print sections (no Army Rules, has Special Rules + Magic + Spells)', () => {
    useArmyStore.getState().setArmy('empire');
    const s = useArmyStore.getState();
    const ids = availablePrintSections({
      hasArmyRules: !!s.army?.armyRules,
      hasSpecialRules: !!s.specialRules,
      magic: s.magic,
    }).map((section) => section.id);

    expect(ids).toEqual(['stats', 'specialRules', 'magicItems', 'spells']);
  });
});
