import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_GAME_SIZE } from '@/store/armyData';
import { SMALLEST_GAME } from '@/test/gameSizes';
import { get, messages, unit, validateNamed } from './validationFixtures';

/** Below one army-size step, where numeric minimums are not enforced. */
const UNDER_ONE_STEP_GAME = 800;
/** Not a multiple of 1,000, to exercise the thousands separator. */
const NON_ROUND_GAME = 1850;
const NEGATIVE_GAME = -500;

// Goblin army limits at one army-size step.
const GOBLIN_MIN = 4;

beforeEach(() => {
  get().reset();
});

// ---------------------------------------------------------------------------
// Size scaling: armySize = max(1, floor(points/1000)). EVERY other test runs
// at size 1, so the `min*size` / `max*size` / `size-1` arithmetic is only ever
// multiplied by 1. These drive size 2 (via a 2,000-point filler) so a refactor
// of armySize or the scaling math is caught.
// ---------------------------------------------------------------------------
describe('numeric min/max scale with the game-size cap (synthetic, size 2)', () => {
  it('scales the numeric min by size (min 2 -> 4 at a 2,000 cap)', () => {
    const units = { a: unit({ min: 2, number: 1, pointsCost: 0 }) };

    expect(validateNamed(units, {}, DEFAULT_GAME_SIZE).map((e) => e.message)).toContain(
      'Minimum of 4 A per 2,000 points.',
    );
  });

  it('scales the numeric max by size (max 4 -> 8 at a 2,000 cap)', () => {
    const units = { a: unit({ max: 4, number: 9, pointsCost: 0 }) };

    expect(validateNamed(units, {}, DEFAULT_GAME_SIZE).map((e) => e.message)).toContain(
      'Maximum of 8 A per 2,000 points.',
    );
  });

  it("scales the 'elite' max by size (size-1 = 1 at a 2,000 cap)", () => {
    const units = { a: unit({ max: 'elite', number: 2, pointsCost: 0 }) };

    expect(validateNamed(units, {}, DEFAULT_GAME_SIZE).map((e) => e.message)).toContain(
      'Maximum of 1 A per 2,000 points.',
    );
  });
});

describe('over-cap (points ceiling)', () => {
  it('flags a list whose points exceed the cap', () => {
    const units = { a: unit({ number: 1, pointsCost: 1200 }) };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).toContain(
      'List is 200 points over the 1,000 cap.',
    );
  });

  it('does NOT flag a list exactly at the cap', () => {
    const units = { a: unit({ number: 1, pointsCost: 1000 }) };

    expect(
      validateNamed(units, {}, SMALLEST_GAME).some((e) => /points over the/.test(e.message)),
    ).toBe(false);
  });

  it('formats a non-multiple cap with a thousands separator', () => {
    const units = { a: unit({ number: 1, pointsCost: 2000 }) };

    expect(validateNamed(units, {}, NON_ROUND_GAME).map((e) => e.message)).toContain(
      'List is 150 points over the 1,850 cap.',
    );
  });
});

describe('size derives from the cap, not current points', () => {
  it('applies the size-2 minimum even when the list has few points', () => {
    const units = { a: unit({ min: 2, number: 1, pointsCost: 100 }) };

    expect(validateNamed(units, {}, DEFAULT_GAME_SIZE).map((e) => e.message)).toContain(
      'Minimum of 4 A per 2,000 points.',
    );
  });

  it('ignores minimums but still enforces maximums when the cap is below 1,000', () => {
    const units = { a: unit({ min: 2, max: 4, number: 5, pointsCost: 0 }) };
    const msgs = validateNamed(units, {}, UNDER_ONE_STEP_GAME).map((e) => e.message);

    expect(msgs.some((m) => /Minimum of/.test(m))).toBe(false);
    expect(msgs).toContain('Maximum of 4 A per 1,000 points.');
  });
});

describe('setGameSize recomputes errors', () => {
  it('changes scaled minimum errors when the cap changes', () => {
    get().setArmy('goblin');
    get().setGameSize(SMALLEST_GAME); // size 1 -> min 4
    get().setUnitNumber('goblins', GOBLIN_MIN); // exactly the minimum at this cap
    expect(messages().some((m) => /Minimum of \d+ Goblins/.test(m))).toBe(false);

    // Raising the cap does NOT auto-adjust the existing list; the soft error
    // surfaces so the user can correct it.
    get().setGameSize(DEFAULT_GAME_SIZE); // size 2 -> min 8, now 4 is short
    expect(messages()).toContain('Minimum of 8 Goblins per 2,000 points.');
  });

  it('clamps a negative cap to 0', () => {
    get().setArmy('goblin');
    get().setGameSize(NEGATIVE_GAME);

    expect(get().gameSize).toBe(0);
  });

  it('clamps a non-finite cap (NaN, the empty-input path) to 0', () => {
    get().setArmy('goblin');
    get().setGameSize(NaN);

    expect(get().gameSize).toBe(0);
  });
});
