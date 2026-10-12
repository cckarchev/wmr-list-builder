import { describe, expect, it } from 'vitest';
import { completeOrder, moveInOrder, orderById } from './sectionOrder';

const DEFAULT_ORDER = ['stats', 'armyRules', 'magicItems', 'spells'];

describe('completeOrder', () => {
  it('uses the default order when nothing is stored', () => {
    expect(completeOrder([], DEFAULT_ORDER)).toEqual(DEFAULT_ORDER);
  });

  it('keeps the stored order of the known ids', () => {
    const stored = ['spells', 'stats', 'magicItems', 'armyRules'];

    expect(completeOrder(stored, DEFAULT_ORDER)).toEqual(stored);
  });

  it('drops unknown and repeated ids, and appends the missing ones in default order', () => {
    const stored = ['spells', 'legacy', 'spells', 'stats'];

    expect(completeOrder(stored, DEFAULT_ORDER)).toEqual([
      'spells',
      'stats',
      'armyRules',
      'magicItems',
    ]);
  });
});

describe('orderById', () => {
  it('sorts items by their place in the order', () => {
    const items = [{ id: 'stats' }, { id: 'spells' }, { id: 'armyRules' }];
    const order = ['spells', 'armyRules', 'stats'];

    expect(orderById(items, order).map((item) => item.id)).toEqual(order);
  });

  it('leaves items missing from the order at the end, as they came', () => {
    const items = [{ id: 'extra' }, { id: 'stats' }, { id: 'other' }];

    expect(orderById(items, ['stats']).map((item) => item.id)).toEqual(['stats', 'extra', 'other']);
  });
});

const UP = -1;
const DOWN = 1;
const ALL_MOVABLE = new Set(DEFAULT_ORDER);

describe('moveInOrder', () => {
  it('swaps an id with the one above it', () => {
    expect(moveInOrder(DEFAULT_ORDER, 'armyRules', UP, ALL_MOVABLE)).toEqual([
      'armyRules',
      'stats',
      'magicItems',
      'spells',
    ]);
  });

  it('swaps an id with the one below it', () => {
    expect(moveInOrder(DEFAULT_ORDER, 'armyRules', DOWN, ALL_MOVABLE)).toEqual([
      'stats',
      'magicItems',
      'armyRules',
      'spells',
    ]);
  });

  it('leaves the order alone at either end', () => {
    expect(moveInOrder(DEFAULT_ORDER, 'stats', UP, ALL_MOVABLE)).toEqual(DEFAULT_ORDER);
    expect(moveInOrder(DEFAULT_ORDER, 'spells', DOWN, ALL_MOVABLE)).toEqual(DEFAULT_ORDER);
  });

  it('jumps over ids that are not movable, such as sections this list lacks', () => {
    const movable = new Set(['stats', 'armyRules', 'spells']);

    expect(moveInOrder(DEFAULT_ORDER, 'spells', UP, movable)).toEqual([
      'stats',
      'spells',
      'magicItems',
      'armyRules',
    ]);
  });

  it('leaves the order alone when only unmovable ids lie beyond', () => {
    const movable = new Set(['stats', 'armyRules']);

    expect(moveInOrder(DEFAULT_ORDER, 'armyRules', DOWN, movable)).toEqual(DEFAULT_ORDER);
  });

  it('leaves the order alone for an unknown id', () => {
    expect(moveInOrder(DEFAULT_ORDER, 'legacy', UP, ALL_MOVABLE)).toEqual(DEFAULT_ORDER);
  });
});
