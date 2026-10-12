import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_GAME_SIZE } from '@/store/armyData';
import { SMALLEST_GAME } from '@/test/gameSizes';
import { get, unit, validateNamed } from './validationFixtures';

beforeEach(() => {
  get().reset();
});

describe('army max (real data: goblin Goblin Warboss armyMax 1)', () => {
  it('hard-clamps a unit to its armyMax; validation backstops the logic', () => {
    get().setArmy('goblin');
    // Force limit prevents exceeding armyMax through the store.
    get().setUnitNumber('goblinWarboss', 2);

    expect(get().units.goblinWarboss.number).toBe(1);

    // The underlying validation logic still flags an over-max state.
    const over = validateNamed(
      { goblinWarboss: unit({ name: 'Goblin Warboss', number: 2, armyMax: 1, points: 80 }) },
      {},
      DEFAULT_GAME_SIZE,
    ).map((e) => e.message);

    expect(over).toContain('Maximum of 1 Goblin Warboss per army.');
  });
});

describe('numeric max scales with the game-size cap (goblin Trolls max 4)', () => {
  it('flags Trolls above max*size at the default 2,000 cap', () => {
    // The store hard-clamps Trolls to max*size, so an over-max count is only
    // reachable through the validation logic directly.
    const errors = validateNamed(
      { trolls: unit({ name: 'Trolls', number: 9, max: 4, points: 110, type: 'Monster' }) },
      {},
      DEFAULT_GAME_SIZE,
    ).map((e) => e.message);

    expect(errors).toContain('Maximum of 8 Trolls per 2,000 points.');
  });
});

// ---------------------------------------------------------------------------
// Keyword max branches: ABSENT from Revolution data,
// exercised via synthetic state to prove the ported logic is faithful.
// ---------------------------------------------------------------------------
describe('keyword max branches (synthetic - not present in Revolution data)', () => {
  it("max 'elite'", () => {
    const units = { a: unit({ max: 'elite', number: 1, points: 100 }) };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Maximum of 0 A per 1,000 points.',
    );
  });

  it("max 'Half or None'", () => {
    const units = {
      a: unit({ max: 'Half or None', number: 3, requiredUnits: ['b'] }),
      b: unit({ number: 2 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Maximum of 1 A per 2 B.',
    );
  });

  it("max 'Up to Half'", () => {
    const units = {
      a: unit({ max: 'Up to Half', number: 3, requiredUnits: ['b'] }),
      b: unit({ number: 4 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Maximum of 2 A per 4 B.',
    );
  });

  it('max /^As /', () => {
    const units = {
      a: unit({ max: 'As B', number: 4, requiredUnits: ['b'] }),
      b: unit({ number: 2 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Maximum of 2 A per 2 B.',
    );
  });
});

// ---------------------------------------------------------------------------
// Boundary guards: the max keyword arms use strict comparisons, so an
// off-by-one refactor (< vs <=) would only surface as a FALSE POSITIVE exactly
// at the threshold. None of the positive-case tests pin that edge.
// ---------------------------------------------------------------------------
describe('keyword max does not false-positive at the boundary (synthetic)', () => {
  it("max 'Half or None' is clean at exactly ceil(half) (3 of 5)", () => {
    const units = {
      a: unit({ max: 'Half or None', number: 3, requiredUnits: ['b'] }),
      b: unit({ number: 5 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).not.toContain(
      'Maximum of 3 A per 5 B.',
    );
  });

  it("max 'Up to Half' is clean at exactly floor(half) (2 of 4)", () => {
    const units = {
      a: unit({ max: 'Up to Half', number: 2, requiredUnits: ['b'] }),
      b: unit({ number: 4 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).not.toContain(
      'Maximum of 2 A per 4 B.',
    );
  });

  it('max /^As / is clean when number equals requiredCount', () => {
    const units = {
      a: unit({ max: 'As B', number: 2, requiredUnits: ['b'] }),
      b: unit({ number: 2 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).not.toContain(
      'Maximum of 2 A per 2 B.',
    );
  });

  it("max 'elite' is clean at exactly size-1 (1 unit, size 2)", () => {
    const units = { a: unit({ max: 'elite', number: 1, pointsCost: 0 }) };

    expect(validateNamed(units, {}, DEFAULT_GAME_SIZE).map((e) => e.message)).not.toContain(
      'Maximum of 1 A per 2,000 points.',
    );
  });
});
