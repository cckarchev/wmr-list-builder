import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_GAME_SIZE } from '@/store/armyData';
import { SMALLEST_GAME } from '@/test/gameSizes';
import { get, messages, unit, upgrade, validateNamed } from './fixtures';

/** Two of each artillery piece, over the two they may take between them at 2,000 points. */
const ARTILLERY_EACH = 2;

beforeEach(() => {
  get().reset();
});

// Items that count together toward one limit break it together, so the list has
// one problem, not one per item. Each item names the group from its own side,
// which once gave "A or B" and "B or A" as two separate issues.
describe('homologous items report a shared limit once', () => {
  it('reports one error for a pair that lists each other', () => {
    const units = {
      a: unit({ armyMax: 1, number: 1, homologousUnits: ['b'] }),
      b: unit({ armyMax: 1, number: 1, homologousUnits: ['a'] }),
    };
    const errors = validateNamed(units, {}, SMALLEST_GAME);

    expect(errors).toEqual([{ targets: ['a', 'b'], message: 'Maximum of 1 A or B per army.' }]);
  });

  it('names the group in the order the items are listed, whichever reports it', () => {
    const units = {
      a: unit({ number: 1 }),
      b: unit({ armyMax: 1, number: 1, homologousUnits: ['a'] }),
    };
    const errors = validateNamed(units, {}, SMALLEST_GAME);

    expect(errors).toEqual([{ targets: ['a', 'b'], message: 'Maximum of 1 A or B per army.' }]);
  });

  it('reports one error for homologous upgrades too', () => {
    const upgrades = {
      u1: upgrade({ armyMax: 1, number: 1, homologousUpgrades: ['u2'] }),
      u2: upgrade({ armyMax: 1, number: 1, homologousUpgrades: ['u1'] }),
    };
    const errors = validateNamed({}, upgrades, SMALLEST_GAME);

    expect(errors).toEqual([{ targets: ['u1', 'u2'], message: 'Maximum of 1 U1 or U2 per army.' }]);
  });

  it('keeps apart unrelated items that share a name and break the same rule', () => {
    const units = {
      a: unit({ name: 'Handgunners', armyMax: 1, number: 2 }),
      b: unit({ name: 'Handgunners', armyMax: 1, number: 2 }),
    };
    const errors = validateNamed(units, {}, SMALLEST_GAME);

    expect(errors).toEqual([
      { targets: ['a'], message: 'Maximum of 1 Handgunners per army.' },
      { targets: ['b'], message: 'Maximum of 1 Handgunners per army.' },
    ]);
  });

  it('reports the Chaos Dwarf artillery over its shared maximum once', () => {
    get().setArmy('chaos-dwarfs');
    get().setGameSize(DEFAULT_GAME_SIZE);
    get().setUnitNumber('earthshakerCannon', ARTILLERY_EACH);
    get().setUnitNumber('deathRocket', ARTILLERY_EACH);

    expect(messages()).toEqual([
      'Maximum of 2 Earthshaker Cannon or Death Rocket per 2,000 points.',
    ]);
  });
});
