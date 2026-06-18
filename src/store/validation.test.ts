import { describe, it, expect, beforeEach } from 'vitest';
import { useArmyStore } from './useArmyStore';
import { validate } from './validation';
import { toSentence } from './toSentence';
import type { UnitState, UpgradeState } from './storeHelpers';

const get = () => useArmyStore.getState();
const messages = () => validate(get().units, get().upgrades).map((e) => e.message);

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
  it('flags a missing armyMin General on a fresh list, and clears it once taken', () => {
    get().setArmy('goblin');
    expect(messages()).toContain('Minimum of 1 Goblin Warboss per army.');
    expect(get().errors.map((e) => e.message)).toContain('Minimum of 1 Goblin Warboss per army.');

    get().setUnitNumber('Goblin Warboss', 1);
    expect(messages()).not.toContain('Minimum of 1 Goblin Warboss per army.');
    expect(get().errors.map((e) => e.message)).not.toContain(
      'Minimum of 1 Goblin Warboss per army.',
    );
  });

  it('flags exceeding armyMax', () => {
    get().setArmy('goblin');
    get().setUnitNumber('Goblin Warboss', 2);
    expect(messages()).toContain('Maximum of 1 Goblin Warboss per army.');
  });
});

describe('numeric min per 1,000 points (real data: goblin Goblins min 4)', () => {
  it('flags Goblins below min*size once pointsCost >= 1000', () => {
    get().setArmy('goblin');
    get().setUnitNumber('Goblins', 1); // 30 pts
    get().setUnitNumber('Trolls', 10); // 1100 pts -> total 1130, size 1
    expect(useArmyStore.getState().units.Goblins.pointsCost).toBe(30);
    expect(messages()).toContain('Minimum of 4 Goblins per 1,000 points.');
  });

  it('does not flag the numeric min while under 1000 points', () => {
    get().setArmy('goblin');
    get().setUnitNumber('Goblins', 1); // 30 pts, under 1000
    expect(messages()).not.toContain('Minimum of 4 Goblins per 1,000 points.');
  });
});

describe('numeric max per 1,000 points (real data: goblin Trolls max 4)', () => {
  it('flags Trolls above max*size', () => {
    get().setArmy('goblin');
    get().setUnitNumber('Trolls', 5); // 550 pts, size 1
    expect(messages()).toContain('Maximum of 4 Trolls per 1,000 points.');
  });
});

describe('homologousUnits (real data: chaos-dwarfs Earthshaker Cannon <-> Death Rocket)', () => {
  it('sums homologous counts and builds the id sentence', () => {
    get().setArmy('chaos-dwarfs');
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
    get().setUnitNumber(augendUnitID, 1); // 1 augend, 0 base units
    expect(messages()).toContain(`1 ${augendUnitID} requires at least 1 ${toSentence(augends)}.`);
  });
});

describe('a clean, legal list of >= 1000 points produces NO errors', () => {
  it('goblin list satisfying every min/max', () => {
    get().setArmy('goblin');
    get().setUnitNumber('Goblin Warboss', 1); // armyMin/Max 1
    get().setUnitNumber('Goblins', 4); // min 4
    get().setUnitNumber('Wolf Riders', 2); // min 2
    get().setUnitNumber('Trolls', 4); // max 4
    get().setUnitNumber('Wolf Chariots', 4); // max 4 -> total 1060 pts
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
    expect(validate(units, {}).map((e) => e.message)).toContain('Minimum of 3 A per 3 B.');
  });

  it("min 'Half or All'", () => {
    const units = {
      A: unit({ min: 'Half or All', number: 1, requiredUnits: ['B'] }),
      B: unit({ number: 4 }),
    };
    expect(validate(units, {}).map((e) => e.message)).toContain(
      'Half or all B must be upgraded to A.',
    );
  });

  it("min 'Half or More'", () => {
    const units = {
      A: unit({ min: 'Half or More', number: 1, requiredUnits: ['B'] }),
      B: unit({ number: 6 }),
    };
    expect(validate(units, {}).map((e) => e.message)).toContain('Minimum of 3 A per 6 B.');
  });

  it("min 'Half or None'", () => {
    const units = {
      A: unit({ min: 'Half or None', number: 1, requiredUnits: ['B'] }),
      B: unit({ number: 6 }),
    };
    expect(validate(units, {}).map((e) => e.message)).toContain('Minimum of 3 A per 6 B.');
  });

  it('min /^As /', () => {
    const units = {
      A: unit({ min: 'As B', number: 1, requiredUnits: ['B'] }),
      B: unit({ number: 3 }),
    };
    expect(validate(units, {}).map((e) => e.message)).toContain('Minimum of 3 A per 3 B.');
  });

  it("max 'elite'", () => {
    // size = max(1, floor(points/1000)); 1 unit @ 100 pts -> size 1 -> max 0
    const units = { A: unit({ max: 'elite', number: 1, points: 100 }) };
    expect(validate(units, {}).map((e) => e.message)).toContain('Maximum of 0 A per 1,000 points.');
  });

  it("max 'Half or None'", () => {
    const units = {
      A: unit({ max: 'Half or None', number: 3, requiredUnits: ['B'] }),
      B: unit({ number: 2 }),
    };
    expect(validate(units, {}).map((e) => e.message)).toContain('Maximum of 1 A per 2 B.');
  });

  it("max 'Up to Half'", () => {
    const units = {
      A: unit({ max: 'Up to Half', number: 3, requiredUnits: ['B'] }),
      B: unit({ number: 4 }),
    };
    expect(validate(units, {}).map((e) => e.message)).toContain('Maximum of 2 A per 4 B.');
  });

  it('max /^As /', () => {
    const units = {
      A: unit({ max: 'As B', number: 4, requiredUnits: ['B'] }),
      B: unit({ number: 2 }),
    };
    expect(validate(units, {}).map((e) => e.message)).toContain('Maximum of 2 A per 2 B.');
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
    expect(validate(units, upgrades).map((e) => e.message)).toContain(
      '1 A may only have 1 upgrade.',
    );
  });
});
