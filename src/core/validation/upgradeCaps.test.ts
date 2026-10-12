import { beforeEach, describe, expect, it } from 'vitest';
import { SMALLEST_GAME } from '@/test/gameSizes';
import { get, messages, unit, upgrade, validateNamed } from './fixtures';

beforeEach(() => {
  get().reset();
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

// ---------------------------------------------------------------------------
// Unit-upgrade cap: ABSENT from Revolution data,
// exercised via synthetic state to prove the ported logic is faithful.
// ---------------------------------------------------------------------------
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
      m2: upgrade({ type: 'Device of Power' }),
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
