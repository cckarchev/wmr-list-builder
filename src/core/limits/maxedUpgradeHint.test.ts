import { describe, expect, it } from 'vitest';
import type { UnitState, UnitUpgradeEntry, UpgradeState } from '@/core/army-state/types';
import { taken, upgradeOfType } from './fixtures';
import { maxedUpgradeHint } from './maxedUpgradeHint';

const unitWith = (name: string, upgrades: Record<string, UnitUpgradeEntry>): UnitState => ({
  id: name.toLowerCase(),
  name,
  code: 0,
  type: 'Hero',
  points: 0,
  number: 1,
  pointsCost: 0,
  upgrades,
});

const ARMY_MAX_ONE = 1;

const upgradesTaken = (crownTaken: number): Record<string, UpgradeState> => ({
  crown: {
    ...upgradeOfType('crown', 'Device of Power'),
    number: crownTaken,
    armyMax: ARMY_MAX_ONE,
  },
  sword: upgradeOfType('sword', 'Magic Weapon'),
  drummer: upgradeOfType('drummer', 'Command'),
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
});
