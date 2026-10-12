import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_GAME_SIZE } from '@/store/armyData';
import { SMALLEST_GAME } from '@/test/gameSizes';
import { get, messages, unit, validateNamed } from './validationFixtures';

/** Below one army-size step, where numeric minimums are not enforced. */
const UNDER_ONE_STEP_GAME = 800;

beforeEach(() => {
  get().reset();
});

describe('army min (real data: goblin Goblin Warboss armyMin 1)', () => {
  it('auto-includes the armyMin General; validation still flags it when absent', () => {
    get().setArmy('goblin');
    // Force limit auto-includes the Warboss at its armyMin, so it is never missing.
    expect(get().units.goblinWarboss.number).toBe(1);
    expect(messages()).not.toContain('Minimum of 1 Goblin Warboss per army.');

    // The underlying validation logic still flags a missing armyMin unit.
    const absent = validateNamed(
      { goblinWarboss: unit({ name: 'Goblin Warboss', number: 0, armyMin: 1, points: 80 }) },
      {},
      DEFAULT_GAME_SIZE,
    ).map((e) => e.message);

    expect(absent).toContain('Minimum of 1 Goblin Warboss per army.');
  });
});

describe('numeric min scales with the game-size cap (goblin Goblins min 4)', () => {
  it('flags Goblins below min*size at the default 2,000 cap', () => {
    // The store force-includes Goblins at their minimum, so a short count is
    // only reachable through the validation logic directly.
    const errors = validateNamed(
      { goblins: unit({ name: 'Goblins', number: 1, min: 4, points: 30 }) },
      {},
      DEFAULT_GAME_SIZE,
    ).map((e) => e.message);

    expect(errors).toContain('Minimum of 8 Goblins per 2,000 points.');
  });

  it('ignores the minimum when the cap is below 1,000', () => {
    get().setArmy('goblin');
    get().setGameSize(UNDER_ONE_STEP_GAME);
    get().setUnitNumber('goblins', 1);

    expect(messages().some((m) => /Minimum of \d+ Goblins/.test(m))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Keyword min branches: ABSENT from Revolution data,
// exercised via synthetic state to prove the ported logic is faithful.
// ---------------------------------------------------------------------------
describe('keyword min branches (synthetic - not present in Revolution data)', () => {
  it("min 'All or None'", () => {
    const units = {
      a: unit({ min: 'All or None', number: 1, requiredUnits: ['b'] }),
      b: unit({ number: 3 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Minimum of 3 A per 3 B.',
    );
  });

  it("min 'Half or All'", () => {
    const units = {
      a: unit({ min: 'Half or All', number: 1, requiredUnits: ['b'] }),
      b: unit({ number: 4 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Half or all B must be upgraded to A.',
    );
  });

  it("min 'Half or More'", () => {
    const units = {
      a: unit({ min: 'Half or More', number: 1, requiredUnits: ['b'] }),
      b: unit({ number: 6 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Minimum of 3 A per 6 B.',
    );
  });

  it("min 'Half or None'", () => {
    const units = {
      a: unit({ min: 'Half or None', number: 1, requiredUnits: ['b'] }),
      b: unit({ number: 6 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Minimum of 3 A per 6 B.',
    );
  });

  it('min /^As /', () => {
    const units = {
      a: unit({ min: 'As B', number: 1, requiredUnits: ['b'] }),
      b: unit({ number: 3 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Minimum of 3 A per 3 B.',
    );
  });
});

describe("min 'Half or All' second branch (synthetic - the > ceil(req/2) sub-condition)", () => {
  it('flags a count between half and all (not exactly half, not all)', () => {
    // req = 4 -> ceil(4/2) = 2; number 3 is > 2 and < 4 -> violates "half or all".
    const units = {
      a: unit({ min: 'Half or All', number: 3, requiredUnits: ['b'] }),
      b: unit({ number: 4 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Half or all B must be upgraded to A.',
    );
  });

  it('does NOT flag exactly all upgraded', () => {
    const units = {
      a: unit({ min: 'Half or All', number: 4, requiredUnits: ['b'] }),
      b: unit({ number: 4 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).not.toContain(
      'Half or all B must be upgraded to A.',
    );
  });
});

// ---------------------------------------------------------------------------
// army min/max sum homologousCount alongside item.number. The real-data
// homologous test only reaches the per-1,000 max branch, so the armyMin/armyMax
// + homologous interaction (and the "A or B" id sentence on those messages) is
// otherwise untested.
// ---------------------------------------------------------------------------
describe('armyMin/armyMax include homologousUnits count (synthetic)', () => {
  it('flags an armyMin shortfall across homologous units, and clears it', () => {
    const units = {
      a: unit({ armyMin: 3, number: 1, homologousUnits: ['b'] }),
      b: unit({ number: 1 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Minimum of 3 A or B per army.',
    );

    units.b.number = 2; // 1 + 2 = 3 -> satisfies armyMin
    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).not.toContain(
      'Minimum of 3 A or B per army.',
    );
  });
});

// ---------------------------------------------------------------------------
// Boundary guards: the min keyword arms use strict comparisons, so an
// off-by-one refactor (< vs <=) would only surface as a FALSE POSITIVE exactly
// at the threshold. None of the positive-case tests pin that edge.
// ---------------------------------------------------------------------------
describe('keyword min does not false-positive at the boundary (synthetic)', () => {
  it("'All or None' is clean when fully upgraded, and when none are taken", () => {
    const all = {
      a: unit({ min: 'All or None', number: 3, requiredUnits: ['b'] }),
      b: unit({ number: 3 }),
    };

    expect(validateNamed(all, {}, SMALLEST_GAME).map((e) => e.message)).not.toContain(
      'Minimum of 3 A per 3 B.',
    );
    const none = {
      a: unit({ min: 'All or None', number: 0, requiredUnits: ['b'] }),
      b: unit({ number: 3 }),
    };

    expect(validateNamed(none, {}, SMALLEST_GAME).map((e) => e.message)).not.toContain(
      'Minimum of 3 A per 3 B.',
    );
  });

  it("'Half or More' is clean at exactly half (3 of 6)", () => {
    const units = {
      a: unit({ min: 'Half or More', number: 3, requiredUnits: ['b'] }),
      b: unit({ number: 6 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).not.toContain(
      'Minimum of 3 A per 6 B.',
    );
  });

  it("'Half or None' min is clean at exactly half (3 of 6)", () => {
    const units = {
      a: unit({ min: 'Half or None', number: 3, requiredUnits: ['b'] }),
      b: unit({ number: 6 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).not.toContain(
      'Minimum of 3 A per 6 B.',
    );
  });

  it('min /^As / is clean when number equals requiredCount', () => {
    const units = {
      a: unit({ min: 'As B', number: 3, requiredUnits: ['b'] }),
      b: unit({ number: 3 }),
    };

    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).not.toContain(
      'Minimum of 3 A per 3 B.',
    );
  });
});
