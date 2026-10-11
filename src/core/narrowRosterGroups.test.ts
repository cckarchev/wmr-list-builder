import { describe, expect, it } from 'vitest';
import { narrowRosterGroups } from './narrowRosterGroups';

const GROUPS = [
  { label: 'Characters', unitIds: ['General', 'Hero'] },
  { label: 'Infantry', unitIds: ['Spearmen', 'Archers'] },
];

const NUMBERS: Record<string, number> = { General: 1, Hero: 0, Spearmen: 0, Archers: 2 };

const SELECTED_COUNT = (id: string) => NUMBERS[id];

describe('narrowRosterGroups', () => {
  it('keeps every group when no filter is active', () => {
    const result = narrowRosterGroups(GROUPS, {
      activeType: null,
      selectedOnly: false,
      countOf: SELECTED_COUNT,
    });

    expect(result).toEqual(GROUPS);
  });

  it('keeps only the active type', () => {
    const result = narrowRosterGroups(GROUPS, {
      activeType: 'Infantry',
      selectedOnly: false,
      countOf: SELECTED_COUNT,
    });

    expect(result.map((group) => group.label)).toEqual(['Infantry']);
  });

  it('keeps only selected units when selectedOnly is on', () => {
    const result = narrowRosterGroups(GROUPS, {
      activeType: null,
      selectedOnly: true,
      countOf: SELECTED_COUNT,
    });

    expect(result).toEqual([
      { label: 'Characters', unitIds: ['General'] },
      { label: 'Infantry', unitIds: ['Archers'] },
    ]);
  });

  it('drops groups left empty by the filters', () => {
    const result = narrowRosterGroups(GROUPS, {
      activeType: 'Characters',
      selectedOnly: true,
      countOf: (id) => (id === 'Archers' ? 1 : 0),
    });

    expect(result).toEqual([]);
  });
});
