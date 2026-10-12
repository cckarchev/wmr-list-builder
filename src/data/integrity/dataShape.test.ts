import { describe, expect, it } from 'vitest';
import { armiesById } from '@/data/armyIndex';
import { magicItems } from '@/data/magicItems';

const armies = Object.entries(armiesById);

const noEmpty = (arr: string[] | undefined, label: string) => {
  if (!arr) {
    return;
  }

  arr.forEach((line, i) => {
    expect(line.trim().length, `${label}[${i}] is empty`).toBeGreaterThan(0);
  });
};

describe('data shape after cleanup', () => {
  it('no text/armyRules array contains empty-string separators', () => {
    for (const [id, army] of armies) {
      noEmpty(army.armyRules, `${id} armyRules`);

      for (const [name, rule] of Object.entries(army.specialRules ?? {})) {
        noEmpty(rule.text, `${id} rule ${name}`);
      }

      for (const spell of army.spells ?? []) {
        noEmpty(spell.text, `${id} spell ${spell.name}`);
      }
    }

    for (const [name, item] of Object.entries(magicItems.upgrades)) {
      noEmpty(item.text, `magic item ${name}`);
    }
  });

  it('every spell has a non-empty fluff and no fluff asterisks', () => {
    for (const [id, army] of armies) {
      for (const spell of army.spells ?? []) {
        expect(spell.fluff?.trim().length, `${id} ${spell.name} fluff`).toBeGreaterThan(0);
        expect(spell.fluff, `${id} ${spell.name} fluff asterisks`).not.toMatch(/^\*|\*$/);
      }
    }
  });

  it('no order field on units, upgrades, or magic items', () => {
    for (const [id, army] of armies) {
      for (const [name, unit] of Object.entries(army.units)) {
        expect('order' in unit, `${id} unit ${name}`).toBe(false);
      }

      for (const [name, up] of Object.entries(army.upgrades ?? {})) {
        expect('order' in up, `${id} upgrade ${name}`).toBe(false);
      }
    }

    for (const [name, item] of Object.entries(magicItems.upgrades)) {
      expect('order' in item, `magic item ${name}`).toBe(false);
    }
  });

  it('keeps order on special rules', () => {
    const empire = armiesById.empire;
    const handgunners = empire.specialRules?.handgunners;

    expect(handgunners?.order).toBe(1);
  });
});

describe('display names', () => {
  const hasName = (entity: { name?: unknown }) =>
    typeof entity.name === 'string' && entity.name.trim().length > 0;

  it('every unit, upgrade and special rule has a name', () => {
    for (const [id, army] of armies) {
      const entities = [
        ...Object.values(army.units),
        ...Object.values(army.upgrades ?? {}),
        ...Object.values(army.specialRules ?? {}),
      ];

      expect(entities.every(hasName), `${id} names`).toBe(true);
    }
  });

  it('every magic item has a name', () => {
    expect(Object.values(magicItems.upgrades).every(hasName)).toBe(true);
  });
});
