import { beforeEach, describe, expect, it } from 'vitest';
import { loadSectionOrder, saveSectionOrder } from './sectionOrder';

const STORAGE_KEY = 'wmr:printSectionOrder';

describe('print section order persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads nothing when no order is saved', () => {
    expect(loadSectionOrder()).toEqual([]);
  });

  it('loads the order it saved', () => {
    const order = ['spells', 'stats'];

    saveSectionOrder(order);

    expect(loadSectionOrder()).toEqual(order);
  });

  it('keeps only the string ids of a stored list', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['spells', true, null, 'stats']));

    expect(loadSectionOrder()).toEqual(['spells', 'stats']);
  });

  it('loads nothing when the saved value is not a list', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ spells: 1 }));

    expect(loadSectionOrder()).toEqual([]);
  });

  it('loads nothing when the saved value is not valid JSON', () => {
    localStorage.setItem(STORAGE_KEY, '[oops');

    expect(loadSectionOrder()).toEqual([]);
  });
});
