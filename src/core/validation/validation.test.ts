import { beforeEach, describe, expect, it } from 'vitest';
import type { UnitState, UpgradeState } from '@/core/army-state/types';
import { DEFAULT_GAME_SIZE } from '@/store/armyData';
import { useArmyStore } from '@/store/useArmyStore';
import { defined } from '@/test/defined';
import { SMALLEST_GAME } from '@/test/gameSizes';
import { validate } from './validation';
import { get, messages, unit, upgrade, validateNamed } from './validationFixtures';

const MID_GAME = 1500;

// Goblin army limits at one army-size step.
const GOBLIN_MIN = 4;
const TROLL_MAX = 4;
const WOLF_CHARIOT_MAX = 4;

beforeEach(() => {
  get().reset();
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
      m2: upgrade({ type: 'Device of Power' }),
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
