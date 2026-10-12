import { describe, expect, it } from 'vitest';
import { sheetTitle } from './sheetTitle';

describe('sheetTitle', () => {
  it('is the army name when the list is unnamed', () => {
    expect(sheetTitle('Goblin', '')).toBe('Goblin');
  });

  it('joins the army name and the list name', () => {
    expect(sheetTitle('Goblin', 'My List')).toBe('Goblin · My List');
  });
});
