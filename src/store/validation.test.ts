import { describe, it, expect, beforeEach } from 'vitest';
import { useArmyStore } from './useArmyStore';
import { validate } from './validation';
import { toSentence } from './toSentence';
import type { UnitState, UpgradeState } from './storeHelpers';

const get = () => useArmyStore.getState();
const messages = () => validate(get().units, get().upgrades, get().gameSize).map((e) => e.message);

beforeEach(() => {
  get().reset();
});

// Helpers for the keyword min/max + unit-upgrade-cap branches, which do NOT
// occur in any Warmaster Revolution army JSON (verified: every `min`/`max` in
// `src/data/armies/*.json` is numeric, and no unit carries 2+ unit-type
// upgrades). These build minimal state objects to exercise the ported logic.
function unit(partial: Partial<UnitState>): UnitState {
  return {
    order: 0,
    type: 'Infantry',
    points: 100,
    number: 0,
    pointsCost: 0,
    ...partial,
  } as UnitState;
}
function upgrade(partial: Partial<UpgradeState>): UpgradeState {
  return { order: 0, type: 'Infantry', number: 0, ...partial } as UpgradeState;
}

describe('army min / max (real data: goblin Goblin Warboss armyMin/armyMax 1)', () => {
  it('auto-includes the armyMin General; validation still flags it when absent', () => {
    get().setArmy('goblin');
    // Force limit auto-includes the Warboss at its armyMin, so it is never missing.
    expect(get().units['Goblin Warboss'].number).toBe(1);
    expect(messages()).not.toContain('Minimum of 1 Goblin Warboss per army.');

    // The underlying validation logic still flags a missing armyMin unit.
    const absent = validate(
      { 'Goblin Warboss': unit({ number: 0, armyMin: 1, points: 80 }) },
      {},
      2000,
    ).map((e) => e.message);
    expect(absent).toContain('Minimum of 1 Goblin Warboss per army.');
  });

  it('hard-clamps a unit to its armyMax; validation backstops the logic', () => {
    get().setArmy('goblin');
    // Force limit prevents exceeding armyMax through the store.
    get().setUnitNumber('Goblin Warboss', 2);
    expect(get().units['Goblin Warboss'].number).toBe(1);

    // The underlying validation logic still flags an over-max state.
    const over = validate(
      { 'Goblin Warboss': unit({ number: 2, armyMax: 1, points: 80 }) },
      {},
      2000,
    ).map((e) => e.message);
    expect(over).toContain('Maximum of 1 Goblin Warboss per army.');
  });
});

describe('numeric min scales with the game-size cap (goblin Goblins min 4)', () => {
  it('flags Goblins below min*size at the default 2,000 cap', () => {
    // The store force-includes Goblins at their minimum, so a short count is
    // only reachable through the validation logic directly.
    const errors = validate(
      { Goblins: unit({ number: 1, min: 4, points: 30 }) },
      {},
      2000,
    ).map((e) => e.message);
    expect(errors).toContain('Minimum of 8 Goblins per 2,000 points.');
  });

  it('ignores the minimum when the cap is below 1,000', () => {
    get().setArmy('goblin');
    get().setGameSize(800);
    get().setUnitNumber('Goblins', 1);
    expect(messages().some((m) => /Minimum of \d+ Goblins/.test(m))).toBe(false);
  });
});

describe('numeric max scales with the game-size cap (goblin Trolls max 4)', () => {
  it('flags Trolls above max*size at the default 2,000 cap', () => {
    // The store hard-clamps Trolls to max*size, so an over-max count is only
    // reachable through the validation logic directly.
    const errors = validate(
      { Trolls: unit({ number: 9, max: 4, points: 110, type: 'Monster' }) },
      {},
      2000,
    ).map((e) => e.message);
    expect(errors).toContain('Maximum of 8 Trolls per 2,000 points.');
  });
});

describe('homologousUnits (real data: chaos-dwarfs Earthshaker Cannon <-> Death Rocket)', () => {
  it('sums homologous counts and builds the id sentence', () => {
    get().setArmy('chaos-dwarfs');
    get().setGameSize(1000);
    get().setUnitNumber('Earthshaker Cannon', 1);
    get().setUnitNumber('Death Rocket', 1); // combined 2 > max 1
    expect(messages()).toContain(
      'Maximum of 1 Earthshaker Cannon or Death Rocket per 1,000 points.',
    );
  });
});

describe('requiredUnits (real data: albion Fenbeast requires Druid)', () => {
  it('flags a Fenbeast taken without a Druid', () => {
    get().setArmy('albion');
    get().setUnitNumber('Fenbeast', 1);
    expect(messages()).toContain('Fenbeast must be taken with Druid.');

    get().setUnitNumber('Druid', 1);
    expect(messages()).not.toContain('Fenbeast must be taken with Druid.');
  });
});

describe('magic items cap (real data: empire General, 1 model)', () => {
  it('flags a 1-model General carrying 2 magic items', () => {
    get().setArmy('empire');
    get().setUnitNumber('General', 1);
    get().setUnitUpgradeNumber('General', 'Crown of Command', 1); // Device of Power
    get().setUnitUpgradeNumber('General', 'Sword of Destruction', 1); // Magic Weapon
    expect(messages()).toContain('1 General may only have 1 magic item.');
  });
});

describe('mounts cap (real data: goblin Goblin Warboss)', () => {
  it('flags a 1-model General carrying 2 mounts', () => {
    get().setArmy('goblin');
    get().setUnitNumber('Goblin Warboss', 1);
    get().setUnitUpgradeNumber('Goblin Warboss', 'Wolf Chariot', 1); // Chariot Mount
    get().setUnitUpgradeNumber('Goblin Warboss', 'Wyvern', 1); // Monstrous Mount
    expect(messages()).toContain('1 Goblin Warboss may only have 1 mount.');
  });
});

describe('augendUnits (real data: empire Detachment augends Halberdiers/Handgunners/...)', () => {
  it('flags more augend units than the units they attach to', () => {
    get().setArmy('empire');
    // Find the unit carrying augendUnits in the loaded data.
    const augendUnitID = Object.keys(get().units).find(
      (id) => (get().units[id] as UnitState).augendUnits,
    )!;
    const augends = (get().units[augendUnitID] as UnitState).augendUnits!;
    // The store auto-includes the base units at their minimums, so test the
    // augend logic directly with the base units empty.
    const units: Record<string, UnitState> = {
      [augendUnitID]: unit({ number: 1, augendUnits: augends }),
    };
    for (const a of augends) units[a] = unit({ number: 0 });
    const errors = validate(units, {}, 2000).map((e) => e.message);
    expect(errors).toContain(`1 ${augendUnitID} requires at least 1 ${toSentence(augends)}.`);
  });
});

describe('a clean, legal list produces NO errors', () => {
  it('goblin list at a 1,500 cap satisfying every min/max', () => {
    get().setArmy('goblin');
    get().setGameSize(1500); // size 1; minimums un-scaled
    get().setUnitNumber('Goblin Warboss', 1); // armyMin/Max 1
    get().setUnitNumber('Goblins', 4); // min 4
    get().setUnitNumber('Wolf Riders', 2); // min 2
    get().setUnitNumber('Trolls', 4); // max 4
    get().setUnitNumber('Wolf Chariots', 4); // max 4 -> total 1060 pts, <= 1500
    expect(useArmyStore.getState().errors).toEqual([]);
    expect(messages()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Keyword min/max branches + unit-upgrade cap: ABSENT from Revolution data,
// exercised via synthetic state to prove the ported logic is faithful.
// ---------------------------------------------------------------------------
describe('keyword min/max branches (synthetic - not present in Revolution data)', () => {
  it("min 'All or None'", () => {
    const units = {
      A: unit({ min: 'All or None', number: 1, requiredUnits: ['B'] }),
      B: unit({ number: 3 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).toContain('Minimum of 3 A per 3 B.');
  });

  it("min 'Half or All'", () => {
    const units = {
      A: unit({ min: 'Half or All', number: 1, requiredUnits: ['B'] }),
      B: unit({ number: 4 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).toContain(
      'Half or all B must be upgraded to A.',
    );
  });

  it("min 'Half or More'", () => {
    const units = {
      A: unit({ min: 'Half or More', number: 1, requiredUnits: ['B'] }),
      B: unit({ number: 6 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).toContain('Minimum of 3 A per 6 B.');
  });

  it("min 'Half or None'", () => {
    const units = {
      A: unit({ min: 'Half or None', number: 1, requiredUnits: ['B'] }),
      B: unit({ number: 6 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).toContain('Minimum of 3 A per 6 B.');
  });

  it('min /^As /', () => {
    const units = {
      A: unit({ min: 'As B', number: 1, requiredUnits: ['B'] }),
      B: unit({ number: 3 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).toContain('Minimum of 3 A per 3 B.');
  });

  it("max 'elite'", () => {
    const units = { A: unit({ max: 'elite', number: 1, points: 100 }) };
    expect(validate(units, {}, 1000).map((e) => e.message)).toContain(
      'Maximum of 0 A per 1,000 points.',
    );
  });

  it("max 'Half or None'", () => {
    const units = {
      A: unit({ max: 'Half or None', number: 3, requiredUnits: ['B'] }),
      B: unit({ number: 2 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).toContain('Maximum of 1 A per 2 B.');
  });

  it("max 'Up to Half'", () => {
    const units = {
      A: unit({ max: 'Up to Half', number: 3, requiredUnits: ['B'] }),
      B: unit({ number: 4 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).toContain('Maximum of 2 A per 4 B.');
  });

  it('max /^As /', () => {
    const units = {
      A: unit({ max: 'As B', number: 4, requiredUnits: ['B'] }),
      B: unit({ number: 2 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).toContain('Maximum of 2 A per 2 B.');
  });
});

describe('unit-upgrades cap (synthetic - no Revolution unit has 2+ unit-type upgrades)', () => {
  it('flags a 1-model unit carrying 2 unit-type upgrades', () => {
    const units = {
      A: unit({
        number: 1,
        upgrades: { U1: { number: 1, pointsCost: 0 }, U2: { number: 1, pointsCost: 0 } },
      }),
    };
    const upgrades = {
      U1: upgrade({ type: 'Infantry' }),
      U2: upgrade({ type: 'Cavalry' }),
    };
    expect(validate(units, upgrades, 1000).map((e) => e.message)).toContain(
      '1 A may only have 1 upgrade.',
    );
  });

  it('flags a 2-model unit carrying 3 unit-type upgrades (plural message)', () => {
    const units = {
      A: unit({
        number: 2,
        upgrades: {
          U1: { number: 2, pointsCost: 0 },
          U2: { number: 1, pointsCost: 0 },
        },
      }),
    };
    const upgrades = {
      U1: upgrade({ type: 'Infantry' }),
      U2: upgrade({ type: 'Cavalry' }),
    };
    expect(validate(units, upgrades, 1000).map((e) => e.message)).toContain(
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
      A: upgrade({ number: 1, homologousUpgrades: ['B'], armyMax: 1 }),
      B: upgrade({ number: 1 }),
    };
    expect(validate({}, upgrades, 1000).map((e) => e.message)).toContain(
      'Maximum of 1 A or B per army.',
    );
  });
});

describe('requiredUpgrades (synthetic - not present in Revolution data)', () => {
  it('feeds the keyword-min requiredCount via upgrades', () => {
    const upgrades = {
      A: upgrade({ min: 'As B', number: 1, requiredUpgrades: ['B'] }),
      B: upgrade({ number: 3 }),
    };
    expect(validate({}, upgrades, 1000).map((e) => e.message)).toContain('Minimum of 3 A per 3 B.');
  });

  it('flags an upgrade taken without its requiredUpgrades ("must be taken with")', () => {
    const upgrades = {
      A: upgrade({ number: 1, requiredUpgrades: ['B'] }),
      B: upgrade({ number: 0 }),
    };
    const msgs = validate({}, upgrades, 1000).map((e) => e.message);
    expect(msgs).toContain('A must be taken with B.');

    upgrades.B.number = 1;
    expect(validate({}, upgrades, 1000).map((e) => e.message)).not.toContain(
      'A must be taken with B.',
    );
  });
});

describe('prohibited constraints (synthetic - not present in Revolution data)', () => {
  it('flags prohibitedUnits ("cannot be taken with")', () => {
    const units = {
      A: unit({ number: 1, prohibitedUnits: ['B'] }),
      B: unit({ number: 1 }),
    };
    const msgs = validate(units, {}, 1000).map((e) => e.message);
    expect(msgs).toContain('A cannot be taken with B.');

    units.B.number = 0;
    expect(validate(units, {}, 1000).map((e) => e.message)).not.toContain(
      'A cannot be taken with B.',
    );
  });

  it('flags prohibitedUpgrades ("cannot be taken with")', () => {
    const upgrades = {
      A: upgrade({ number: 1, prohibitedUpgrades: ['B'] }),
      B: upgrade({ number: 1 }),
    };
    expect(validate({}, upgrades, 1000).map((e) => e.message)).toContain(
      'A cannot be taken with B.',
    );
  });
});

describe("min 'Half or All' second branch (synthetic - the > ceil(req/2) sub-condition)", () => {
  it('flags a count between half and all (not exactly half, not all)', () => {
    // req = 4 -> ceil(4/2) = 2; number 3 is > 2 and < 4 -> violates "half or all".
    const units = {
      A: unit({ min: 'Half or All', number: 3, requiredUnits: ['B'] }),
      B: unit({ number: 4 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).toContain(
      'Half or all B must be upgraded to A.',
    );
  });

  it('does NOT flag exactly all upgraded', () => {
    const units = {
      A: unit({ min: 'Half or All', number: 4, requiredUnits: ['B'] }),
      B: unit({ number: 4 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).not.toContain(
      'Half or all B must be upgraded to A.',
    );
  });
});

describe('magic-items / mounts caps plural message (synthetic)', () => {
  it('pluralizes the magic-item cap for a multi-model unit', () => {
    const units = {
      A: unit({
        number: 2,
        upgrades: { M1: { number: 2, pointsCost: 0 }, M2: { number: 1, pointsCost: 0 } },
      }),
    };
    const upgrades = {
      M1: upgrade({ type: 'Magic Weapon' }),
      M2: upgrade({ type: 'Holy Item' }),
    };
    expect(validate(units, upgrades, 1000).map((e) => e.message)).toContain(
      '2 A may only have 2 magic items.',
    );
  });

  it('pluralizes the mount cap for a multi-model unit', () => {
    const units = {
      A: unit({
        number: 2,
        upgrades: { M1: { number: 2, pointsCost: 0 }, M2: { number: 1, pointsCost: 0 } },
      }),
    };
    const upgrades = {
      M1: upgrade({ type: 'Chariot Mount' }),
      M2: upgrade({ type: 'Monstrous Mount' }),
    };
    expect(validate(units, upgrades, 1000).map((e) => e.message)).toContain(
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
    const units = { A: unit({ min: 2, number: 1, pointsCost: 0 }) };
    expect(validate(units, {}, 2000).map((e) => e.message)).toContain(
      'Minimum of 4 A per 2,000 points.',
    );
  });

  it('scales the numeric max by size (max 4 -> 8 at a 2,000 cap)', () => {
    const units = { A: unit({ max: 4, number: 9, pointsCost: 0 }) };
    expect(validate(units, {}, 2000).map((e) => e.message)).toContain(
      'Maximum of 8 A per 2,000 points.',
    );
  });

  it("scales the 'elite' max by size (size-1 = 1 at a 2,000 cap)", () => {
    const units = { A: unit({ max: 'elite', number: 2, pointsCost: 0 }) };
    expect(validate(units, {}, 2000).map((e) => e.message)).toContain(
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
      A: unit({ armyMin: 3, number: 1, homologousUnits: ['B'] }),
      B: unit({ number: 1 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).toContain(
      'Minimum of 3 A or B per army.',
    );

    units.B.number = 2; // 1 + 2 = 3 -> satisfies armyMin
    expect(validate(units, {}, 1000).map((e) => e.message)).not.toContain(
      'Minimum of 3 A or B per army.',
    );
  });
});

// ---------------------------------------------------------------------------
// Boundary guards: the min/max keyword arms use strict comparisons, so an
// off-by-one refactor (< vs <=) would only surface as a FALSE POSITIVE exactly
// at the threshold. None of the positive-case tests pin that edge.
// ---------------------------------------------------------------------------
describe('keyword min/max do not false-positive at the boundary (synthetic)', () => {
  it("'All or None' is clean when fully upgraded, and when none are taken", () => {
    const all = {
      A: unit({ min: 'All or None', number: 3, requiredUnits: ['B'] }),
      B: unit({ number: 3 }),
    };
    expect(validate(all, {}, 1000).map((e) => e.message)).not.toContain('Minimum of 3 A per 3 B.');
    const none = {
      A: unit({ min: 'All or None', number: 0, requiredUnits: ['B'] }),
      B: unit({ number: 3 }),
    };
    expect(validate(none, {}, 1000).map((e) => e.message)).not.toContain('Minimum of 3 A per 3 B.');
  });

  it("'Half or More' is clean at exactly half (3 of 6)", () => {
    const units = {
      A: unit({ min: 'Half or More', number: 3, requiredUnits: ['B'] }),
      B: unit({ number: 6 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).not.toContain(
      'Minimum of 3 A per 6 B.',
    );
  });

  it("'Half or None' min is clean at exactly half (3 of 6)", () => {
    const units = {
      A: unit({ min: 'Half or None', number: 3, requiredUnits: ['B'] }),
      B: unit({ number: 6 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).not.toContain(
      'Minimum of 3 A per 6 B.',
    );
  });

  it('min /^As / is clean when number equals requiredCount', () => {
    const units = {
      A: unit({ min: 'As B', number: 3, requiredUnits: ['B'] }),
      B: unit({ number: 3 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).not.toContain(
      'Minimum of 3 A per 3 B.',
    );
  });

  it("max 'Half or None' is clean at exactly ceil(half) (3 of 5)", () => {
    const units = {
      A: unit({ max: 'Half or None', number: 3, requiredUnits: ['B'] }),
      B: unit({ number: 5 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).not.toContain(
      'Maximum of 3 A per 5 B.',
    );
  });

  it("max 'Up to Half' is clean at exactly floor(half) (2 of 4)", () => {
    const units = {
      A: unit({ max: 'Up to Half', number: 2, requiredUnits: ['B'] }),
      B: unit({ number: 4 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).not.toContain(
      'Maximum of 2 A per 4 B.',
    );
  });

  it('max /^As / is clean when number equals requiredCount', () => {
    const units = {
      A: unit({ max: 'As B', number: 2, requiredUnits: ['B'] }),
      B: unit({ number: 2 }),
    };
    expect(validate(units, {}, 1000).map((e) => e.message)).not.toContain(
      'Maximum of 2 A per 2 B.',
    );
  });

  it("max 'elite' is clean at exactly size-1 (1 unit, size 2)", () => {
    const units = { A: unit({ max: 'elite', number: 1, pointsCost: 0 }) };
    expect(validate(units, {}, 2000).map((e) => e.message)).not.toContain(
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
      A: unit({
        number: 1,
        requiredUnits: ['B'],
        upgrades: { M1: { number: 1, pointsCost: 0 }, M2: { number: 1, pointsCost: 0 } },
      }),
      B: unit({ number: 0 }),
    };
    const upgrades = {
      M1: upgrade({ type: 'Magic Weapon' }),
      M2: upgrade({ type: 'Holy Item' }),
    };
    const msgs = validate(units, upgrades, 1000).map((e) => e.message);
    expect(msgs).toContain('1 A may only have 1 magic item.');
    expect(msgs).toContain('A must be taken with B.');
  });
});

describe('over-cap (points ceiling)', () => {
  it('flags a list whose points exceed the cap', () => {
    const units = { A: unit({ number: 1, pointsCost: 1200 }) };
    expect(validate(units, {}, 1000).map((e) => e.message)).toContain(
      'List is 200 points over the 1,000 cap.',
    );
  });

  it('does NOT flag a list exactly at the cap', () => {
    const units = { A: unit({ number: 1, pointsCost: 1000 }) };
    expect(validate(units, {}, 1000).some((e) => /points over the/.test(e.message))).toBe(false);
  });

  it('formats a non-multiple cap with a thousands separator', () => {
    const units = { A: unit({ number: 1, pointsCost: 2000 }) };
    expect(validate(units, {}, 1850).map((e) => e.message)).toContain(
      'List is 150 points over the 1,850 cap.',
    );
  });
});

describe('size derives from the cap, not current points', () => {
  it('applies the size-2 minimum even when the list has few points', () => {
    const units = { A: unit({ min: 2, number: 1, pointsCost: 100 }) };
    expect(validate(units, {}, 2000).map((e) => e.message)).toContain(
      'Minimum of 4 A per 2,000 points.',
    );
  });

  it('ignores minimums but still enforces maximums when the cap is below 1,000', () => {
    const units = { A: unit({ min: 2, max: 4, number: 5, pointsCost: 0 }) };
    const msgs = validate(units, {}, 800).map((e) => e.message);
    expect(msgs.some((m) => /Minimum of/.test(m))).toBe(false);
    expect(msgs).toContain('Maximum of 4 A per 1,000 points.');
  });
});

describe('setGameSize recomputes errors', () => {
  it('changes scaled minimum errors when the cap changes', () => {
    get().setArmy('goblin');
    get().setGameSize(1000); // size 1 -> min 4
    get().setUnitNumber('Goblins', 4); // exactly the minimum at this cap
    expect(messages().some((m) => /Minimum of \d+ Goblins/.test(m))).toBe(false);

    // Raising the cap does NOT auto-adjust the existing list; the soft error
    // surfaces so the user can correct it.
    get().setGameSize(2000); // size 2 -> min 8, now 4 is short
    expect(messages()).toContain('Minimum of 8 Goblins per 2,000 points.');
  });

  it('clamps a negative cap to 0', () => {
    get().setArmy('goblin');
    get().setGameSize(-500);
    expect(get().gameSize).toBe(0);
  });

  it('clamps a non-finite cap (NaN, the empty-input path) to 0', () => {
    get().setArmy('goblin');
    get().setGameSize(NaN);
    expect(get().gameSize).toBe(0);
  });
});
