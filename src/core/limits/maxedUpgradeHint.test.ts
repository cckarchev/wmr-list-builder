import { describe, expect, it } from 'vitest';
import type { UnitState, UnitUpgradeEntry, UpgradeState } from '@/core/army-state/types';
import { taken, upgradeOfType } from './fixtures';
import { maxedUpgradeHint } from './maxedUpgradeHint';

const unitWith = (
  name: string,
  upgrades: Record<string, UnitUpgradeEntry>,
  stands = 1,
): UnitState => ({
  id: name.toLowerCase(),
  name,
  code: 0,
  type: 'Hero',
  points: 0,
  number: stands,
  pointsCost: 0,
  upgrades,
});

const ARMY_MAX_ONE = 1;
const FIVE_STANDS = 5;

const upgradesTaken = (crownTaken: number): Record<string, UpgradeState> => ({
  crown: {
    ...upgradeOfType('crown', 'Device of Power'),
    number: crownTaken,
    armyMax: ARMY_MAX_ONE,
  },
  sword: upgradeOfType('sword', 'Magic Weapon'),
  drummer: upgradeOfType('drummer', 'Command'),
  wings: upgradeOfType('wings', 'Special'),
});

describe('maxedUpgradeHint', () => {
  it('names the unit that spent an army-wide allowance', () => {
    const units = {
      general: unitWith('General', { crown: taken(1) }),
      wizard: unitWith('Wizard', {}),
    };

    const hint = maxedUpgradeHint({
      units,
      upgrades: upgradesTaken(1),
      unitId: 'wizard',
      upgradeId: 'crown',
    });

    expect(hint).toBe('Taken by General');
  });

  it("explains the unit's own army-wide upgrade by its kind, not by naming itself", () => {
    const units = { general: unitWith('General', { crown: taken(1) }) };

    const hint = maxedUpgradeHint({
      units,
      upgrades: upgradesTaken(1),
      unitId: 'general',
      upgradeId: 'crown',
    });

    expect(hint).toBe('Already carries 1 magic item');
  });

  it('says the unit has no room left for the kind', () => {
    const units = { general: unitWith('General', { crown: taken(1) }) };

    const hint = maxedUpgradeHint({
      units,
      upgrades: upgradesTaken(1),
      unitId: 'general',
      upgradeId: 'sword',
    });

    expect(hint).toBe('Already carries 1 magic item');
  });

  it('gives nothing while the unit has room and the army allowance is free', () => {
    const units = { general: unitWith('General', {}) };

    const hint = maxedUpgradeHint({
      units,
      upgrades: upgradesTaken(0),
      unitId: 'general',
      upgradeId: 'sword',
    });

    expect(hint).toBeUndefined();
  });

  it('gives the army limit when the unit holds all of it and still has room', () => {
    const units = { halberdiers: unitWith('Halberdiers', { crown: taken(1) }, FIVE_STANDS) };

    const hint = maxedUpgradeHint({
      units,
      upgrades: upgradesTaken(1),
      unitId: 'halberdiers',
      upgradeId: 'crown',
    });

    expect(hint).toBe('Max 1 per army');
  });

  it('gives the stand limit for an upgrade of no capped kind', () => {
    const units = { overlord: unitWith('Overlord', { wings: taken(1) }) };

    const hint = maxedUpgradeHint({
      units,
      upgrades: upgradesTaken(0),
      unitId: 'overlord',
      upgradeId: 'wings',
    });

    expect(hint).toBe('Max 1 per stand');
  });
});
