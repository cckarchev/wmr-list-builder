import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_GAME_SIZE } from '@/store/armyData';
import { useArmyStore } from '@/store/useArmyStore';
import { defined } from '@/test/defined';
import { SMALLEST_GAME } from '@/test/gameSizes';
import type { UnitState, UpgradeState } from './storeHelpers';
import { toSentence } from './toSentence';
import { validate } from './validation';

/** Below one army-size step, where numeric minimums are not enforced. */
const UNDER_ONE_STEP_GAME = 800;
const MID_GAME = 1500;
/** Not a multiple of 1,000, to exercise the thousands separator. */
const NON_ROUND_GAME = 1850;
const NEGATIVE_GAME = -500;

// Goblin army limits at one army-size step.
const GOBLIN_MIN = 4;
const TROLL_MAX = 4;
const WOLF_CHARIOT_MAX = 4;

const get = () => useArmyStore.getState();
const messages = () =>
  validateNamed(get().units, get().upgrades, get().gameSize).map((e) => e.message);

beforeEach(() => {
  get().reset();
});

// Helpers for the keyword min/max + unit-upgrade-cap branches, which do NOT
// occur in any Warmaster Revolution army JSON (verified: every `min`/`max` in
// `src/data/armies/*.json` is numeric, and no unit carries 2+ unit-type
// upgrades). These build minimal state objects to exercise the ported logic.
const unit = (partial: Partial<UnitState>): UnitState =>
  ({
    type: 'Infantry',
    points: 100,
    number: 0,
    pointsCost: 0,
    ...partial,
  }) as UnitState;
const upgrade = (partial: Partial<UpgradeState>): UpgradeState =>
  ({ type: 'Infantry', number: 0, ...partial }) as UpgradeState;

/**
 * Names each synthetic item without a name after its key in upper case
 * (`a` becomes `A`, `u1` becomes `U1`), so messages can quote it.
 */
const named = <T extends { name: string }>(items: Record<string, T>): Record<string, T> => {
  const entries = Object.entries(items).map(([id, item]) => [
    id,
    { ...item, name: item.name || id.toUpperCase() },
  ]);

  return Object.fromEntries(entries);
};

const validateNamed = (
  units: Record<string, UnitState>,
  upgrades: Record<string, UpgradeState>,
  gameSize: number,
) => validate(named(units), named(upgrades), gameSize);

describe('army min / max (real data: goblin Goblin Warboss armyMin/armyMax 1)', () => {
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

describe('homologousUnits (real data: chaos-dwarfs Earthshaker Cannon <-> Death Rocket)', () => {
  it('sums homologous counts and builds the id sentence', () => {
    get().setArmy('chaos-dwarfs');
    get().setGameSize(SMALLEST_GAME);
    get().setUnitNumber('earthshakerCannon', 1);
    get().setUnitNumber('deathRocket', 1); // combined 2 > max 1
    expect(messages()).toContain(
      'Maximum of 1 Earthshaker Cannon or Death Rocket per 1,000 points.',
    );
  });
});

describe('requiredUnits (real data: albion Fenbeast requires Druid)', () => {
  it('flags a Fenbeast taken without a Druid', () => {
    get().setArmy('albion');
    get().setUnitNumber('fenbeast', 1);
    expect(messages()).toContain('Fenbeast must be taken with Druid.');

    get().setUnitNumber('druid', 1);
    expect(messages()).not.toContain('Fenbeast must be taken with Druid.');
  });
});

describe('magic items cap (real data: empire General, 1 model)', () => {
  it('flags a 1-model General carrying 2 magic items', () => {
    get().setArmy('empire');
    get().setUnitNumber('general', 1);
    get().setUnitUpgradeNumber('general', 'crownOfCommand', 1); // Device of Power
    get().setUnitUpgradeNumber('general', 'swordOfDestruction', 1); // Magic Weapon
    expect(messages()).toContain('1 General may only have 1 magic item.');
  });
});

describe('mounts cap (real data: goblin Goblin Warboss)', () => {
  it('flags a 1-model General carrying 2 mounts', () => {
    get().setArmy('goblin');
    get().setUnitNumber('goblinWarboss', 1);
    get().setUnitUpgradeNumber('goblinWarboss', 'wolfChariot', 1); // Chariot Mount
    get().setUnitUpgradeNumber('goblinWarboss', 'wyvern', 1); // Monstrous Mount
    expect(messages()).toContain('1 Goblin Warboss may only have 1 mount.');
  });
});

describe('augendUnits (real data: empire Detachment augends Halberdiers/Handgunners/...)', () => {
  it('flags more augend units than the units they attach to', () => {
    get().setArmy('empire');
    // Find the unit carrying augendUnits in the loaded data.
    const augendUnitId = defined(
      Object.keys(get().units).find((id) => (get().units[id] as UnitState).augendUnits),
    );
    const augends = defined((get().units[augendUnitId] as UnitState).augendUnits);
    const nameOf = (id: string): string => (get().units[id] as UnitState).name;

    // The store auto-includes the base units at their minimums, so test the
    // augend logic directly with the base units empty.
    const units: Record<string, UnitState> = {
      [augendUnitId]: unit({ name: nameOf(augendUnitId), number: 1, augendUnits: augends }),
    };

    for (const a of augends) {
      units[a] = unit({ name: nameOf(a), number: 0 });
    }

    const errors = validate(units, {}, DEFAULT_GAME_SIZE).map((e) => e.message);
    const augendNames = toSentence(augends.map(nameOf));

    expect(errors).toContain(`1 ${nameOf(augendUnitId)} requires at least 1 ${augendNames}.`);
  });
});

describe('a clean, legal list produces NO errors', () => {
  it('goblin list at a 1,500 cap satisfying every min/max', () => {
    get().setArmy('goblin');
    get().setGameSize(MID_GAME); // size 1; minimums un-scaled
    get().setUnitNumber('goblinWarboss', 1); // armyMin/Max 1
    get().setUnitNumber('goblins', GOBLIN_MIN);
    get().setUnitNumber('wolfRiders', 2); // min 2
    get().setUnitNumber('trolls', TROLL_MAX);
    get().setUnitNumber('wolfChariots', WOLF_CHARIOT_MAX); // total 1060 pts, within the cap
    expect(useArmyStore.getState().errors).toEqual([]);
    expect(messages()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Keyword min/max branches + unit-upgrade cap: ABSENT from Revolution data,
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

describe('unit-upgrades cap (synthetic - no Revolution unit has 2+ unit-type upgrades)', () => {
  it('flags a 1-model unit carrying 2 unit-type upgrades', () => {
    const units = {
      a: unit({
        number: 1,
        upgrades: { u1: { number: 1, pointsCost: 0 }, u2: { number: 1, pointsCost: 0 } },
      }),
    };
    const upgrades = {
      u1: upgrade({ type: 'Infantry' }),
      u2: upgrade({ type: 'Cavalry' }),
    };
    expect(validateNamed(units, upgrades, SMALLEST_GAME).map((e) => e.message)).toContain(
      '1 A may only have 1 upgrade.',
    );
  });

  it('flags a 2-model unit carrying 3 unit-type upgrades (plural message)', () => {
    const units = {
      a: unit({
        number: 2,
        upgrades: {
          u1: { number: 2, pointsCost: 0 },
          u2: { number: 1, pointsCost: 0 },
        },
      }),
    };
    const upgrades = {
      u1: upgrade({ type: 'Infantry' }),
      u2: upgrade({ type: 'Cavalry' }),
    };
    expect(validateNamed(units, upgrades, SMALLEST_GAME).map((e) => e.message)).toContain(
      '2 A may only have 2 upgrades.',
    );
  });
});

// ---------------------------------------------------------------------------
// Upgrade-side constraints: homologousUpgrades / requiredUpgrades /
// prohibitedUnits / prohibitedUpgrades are ABSENT from every Revolution army
// JSON (verified by grep), so the branches that read them are reachable only
// via synthetic state. They also exercise the upgrades loop in `validate`,
// which no real-data test reaches (every Revolution constraint lives on a unit).
// ---------------------------------------------------------------------------
describe('homologousUpgrades (synthetic - not present in Revolution data)', () => {
  it('sums homologous upgrade counts and builds the id sentence', () => {
    const upgrades = {
      a: upgrade({ number: 1, homologousUpgrades: ['b'], armyMax: 1 }),
      b: upgrade({ number: 1 }),
    };
    expect(validateNamed({}, upgrades, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Maximum of 1 A or B per army.',
    );
  });
});

describe('requiredUpgrades (synthetic - not present in Revolution data)', () => {
  it('feeds the keyword-min requiredCount via upgrades', () => {
    const upgrades = {
      a: upgrade({ min: 'As B', number: 1, requiredUpgrades: ['b'] }),
      b: upgrade({ number: 3 }),
    };
    expect(validateNamed({}, upgrades, SMALLEST_GAME).map((e) => e.message)).toContain(
      'Minimum of 3 A per 3 B.',
    );
  });

  it('flags an upgrade taken without its requiredUpgrades ("must be taken with")', () => {
    const upgrades = {
      a: upgrade({ number: 1, requiredUpgrades: ['b'] }),
      b: upgrade({ number: 0 }),
    };
    const msgs = validateNamed({}, upgrades, SMALLEST_GAME).map((e) => e.message);
    expect(msgs).toContain('A must be taken with B.');

    upgrades.b.number = 1;
    expect(validateNamed({}, upgrades, SMALLEST_GAME).map((e) => e.message)).not.toContain(
      'A must be taken with B.',
    );
  });
});

describe('prohibited constraints (synthetic - not present in Revolution data)', () => {
  it('flags prohibitedUnits ("cannot be taken with")', () => {
    const units = {
      a: unit({ number: 1, prohibitedUnits: ['b'] }),
      b: unit({ number: 1 }),
    };
    const msgs = validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message);
    expect(msgs).toContain('A cannot be taken with B.');

    units.b.number = 0;
    expect(validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message)).not.toContain(
      'A cannot be taken with B.',
    );
  });

  it('flags prohibitedUpgrades ("cannot be taken with")', () => {
    const upgrades = {
      a: upgrade({ number: 1, prohibitedUpgrades: ['b'] }),
      b: upgrade({ number: 1 }),
    };
    expect(validateNamed({}, upgrades, SMALLEST_GAME).map((e) => e.message)).toContain(
      'A cannot be taken with B.',
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

describe('magic-items / mounts caps plural message (synthetic)', () => {
  it('pluralizes the magic-item cap for a multi-model unit', () => {
    const units = {
      a: unit({
        number: 2,
        upgrades: { m1: { number: 2, pointsCost: 0 }, m2: { number: 1, pointsCost: 0 } },
      }),
    };
    const upgrades = {
      m1: upgrade({ type: 'Magic Weapon' }),
      m2: upgrade({ type: 'Holy Item' }),
    };
    expect(validateNamed(units, upgrades, SMALLEST_GAME).map((e) => e.message)).toContain(
      '2 A may only have 2 magic items.',
    );
  });

  it('pluralizes the mount cap for a multi-model unit', () => {
    const units = {
      a: unit({
        number: 2,
        upgrades: { m1: { number: 2, pointsCost: 0 }, m2: { number: 1, pointsCost: 0 } },
      }),
    };
    const upgrades = {
      m1: upgrade({ type: 'Chariot Mount' }),
      m2: upgrade({ type: 'Monstrous Mount' }),
    };
    expect(validateNamed(units, upgrades, SMALLEST_GAME).map((e) => e.message)).toContain(
      '2 A may only have 2 mounts.',
    );
  });
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
// Boundary guards: the min/max keyword arms use strict comparisons, so an
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

// ---------------------------------------------------------------------------
// Independent violations are separate `if`s (not an else-if chain), so one item
// can report several at once. A refactor that accidentally chains them would
// drop errors silently; this pins that they coexist.
// ---------------------------------------------------------------------------
describe('independent violations stack on a single item (synthetic)', () => {
  it('reports the magic-item cap AND a missing requiredUnit together', () => {
    const units = {
      a: unit({
        number: 1,
        requiredUnits: ['b'],
        upgrades: { m1: { number: 1, pointsCost: 0 }, m2: { number: 1, pointsCost: 0 } },
      }),
      b: unit({ number: 0 }),
    };
    const upgrades = {
      m1: upgrade({ type: 'Magic Weapon' }),
      m2: upgrade({ type: 'Holy Item' }),
    };
    const msgs = validateNamed(units, upgrades, SMALLEST_GAME).map((e) => e.message);
    expect(msgs).toContain('1 A may only have 1 magic item.');
    expect(msgs).toContain('A must be taken with B.');
  });
});

describe('error attribution (targets)', () => {
  it('tags the list-level points error as global (empty targets)', () => {
    const units = { a: unit({ number: 1, pointsCost: 1200 }) };
    const capErr = defined(
      validateNamed(units, {}, SMALLEST_GAME).find((e) => /points over the/.test(e.message)),
    );
    expect(capErr.targets).toEqual([]);
  });

  it('attributes a numeric-min error to the offending unit id', () => {
    const minErr = defined(
      validateNamed(
        { goblins: unit({ name: 'Goblins', number: 1, min: 4, points: 30 }) },
        {},
        DEFAULT_GAME_SIZE,
      ).find((e) => /Minimum of 8 Goblins/.test(e.message)),
    );
    expect(minErr.targets).toEqual(['goblins']);
  });

  it('attributes a homologous error to every homologous id', () => {
    const units = {
      a: unit({ armyMax: 1, number: 1, homologousUnits: ['b'] }),
      b: unit({ number: 1 }),
    };
    const maxErr = defined(
      validateNamed(units, {}, SMALLEST_GAME).find((e) =>
        /Maximum of 1 A or B per army/.test(e.message),
      ),
    );
    expect(maxErr.targets).toEqual(['a', 'b']);
  });

  it('attributes an upgrade error to the upgrade id', () => {
    const upgrades = {
      a: upgrade({ number: 1, requiredUpgrades: ['b'] }),
      b: upgrade({ number: 0 }),
    };
    const err = defined(
      validateNamed({}, upgrades, SMALLEST_GAME).find((e) =>
        /A must be taken with B/.test(e.message),
      ),
    );
    expect(err.targets).toEqual(['a']);
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

describe('messages quote display names, not ids', () => {
  const quoted = (units: Record<string, UnitState>, upgrades: Record<string, UpgradeState> = {}) =>
    validate(units, upgrades, DEFAULT_GAME_SIZE).map((e) => e.message);

  it('names the item in a numeric minimum', () => {
    const units = { goblins: unit({ name: 'Goblins', number: 1, min: GOBLIN_MIN }) };

    expect(quoted(units)).toContain('Minimum of 8 Goblins per 2,000 points.');
  });

  it('names every homologous item in a shared limit', () => {
    const units = {
      cannon: unit({
        name: 'Earthshaker Cannon',
        armyMax: 1,
        number: 1,
        homologousUnits: ['rocket'],
      }),
      rocket: unit({ name: 'Death Rocket', number: 1 }),
    };

    expect(quoted(units)).toContain('Maximum of 1 Earthshaker Cannon or Death Rocket per army.');
  });

  it('names the required units in a keyword minimum', () => {
    const units = {
      banner: unit({
        name: 'Banner Bearers',
        min: 'All or None',
        number: 1,
        requiredUnits: ['knights'],
      }),
      knights: unit({ name: 'Grail Knights', number: 2 }),
    };

    expect(quoted(units)).toContain('Minimum of 2 Banner Bearers per 2 Grail Knights.');
  });

  it('names the units an augend attaches to', () => {
    const units = {
      detachment: unit({ name: 'Detachment', number: 1, augendUnits: ['halberdiers'] }),
      halberdiers: unit({ name: 'Halberdiers', number: 0 }),
    };

    expect(quoted(units)).toContain('1 Detachment requires at least 1 Halberdiers.');
  });

  it('names required and prohibited items', () => {
    const units = {
      fenbeast: unit({ name: 'Fenbeast', number: 1, requiredUnits: ['druid'] }),
      druid: unit({ name: 'Druid', number: 0 }),
    };
    const upgrades = {
      banner: upgrade({ name: 'War Banner', number: 1, prohibitedUpgrades: ['horn'] }),
      horn: upgrade({ name: 'Battle Horn', number: 1 }),
    };

    expect(quoted(units, upgrades)).toEqual(
      expect.arrayContaining([
        'Fenbeast must be taken with Druid.',
        'War Banner cannot be taken with Battle Horn.',
      ]),
    );
  });
});
