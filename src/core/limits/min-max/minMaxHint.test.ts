import { describe, expect, it } from 'vitest';
import { DEFAULT_GAME_SIZE } from '@/store/armyData';
import { explainMinMax } from './explainMinMax';
import { minMaxBadge } from './minMaxBadge';
import { minMaxHint } from './minMaxHint';

describe('minMaxHint', () => {
  it('returns undefined when there are no constraints', () => {
    expect(minMaxHint({}, DEFAULT_GAME_SIZE)).toBeUndefined();
  });

  it('pairs the terse badge with its full rule', () => {
    const troop = { min: 1, max: 6 };

    expect(minMaxHint(troop, DEFAULT_GAME_SIZE)).toEqual({
      badge: minMaxBadge(troop, DEFAULT_GAME_SIZE),
      rule: explainMinMax(troop, DEFAULT_GAME_SIZE),
    });
  });
});
