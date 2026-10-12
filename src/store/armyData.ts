import { buildUnits, buildUpgrades } from '@/core/army-state/buildState';
import type { UnitState, UpgradeState } from '@/core/army-state/types';
import { applyForceMinimums } from '@/core/limits/forceLimits';
import { validate } from '@/core/validation/validation';
import { loadArmy } from '@/data/loadArmy';
import { magicItems } from '@/data/magicItems';
import type { Army, Spell, ValidationError } from '@/data/types';

export const DEFAULT_GAME_SIZE = 2000;

/** The store's data, without its actions. */
export interface ArmyData {
  armyId: string | null;
  army: Army | null;
  units: Record<string, UnitState>;
  upgrades: Record<string, UpgradeState>;
  magic: boolean;
  specialRules: Army['specialRules'];
  spells: Spell[] | undefined;
  version: string;
  label: string;
  errors: ValidationError[];
  gameSize: number;
  loadWarning: string | null;
  savedBaseline: string | null;
}

export const emptyData = (): ArmyData => ({
  armyId: null,
  army: null,
  units: {},
  upgrades: {},
  magic: false,
  specialRules: undefined,
  spells: undefined,
  version: '',
  label: '',
  errors: [],
  gameSize: DEFAULT_GAME_SIZE,
  loadWarning: null,
  savedBaseline: null,
});

/**
 * Port of `initializeState` (actions.js) for the Revolution-only data
 * layer. Builds the full state object for an army id.
 */
export const initializeState = (id: string): ArmyData => {
  const army = loadArmy(id);
  const magic = Boolean(army.magic);
  const armyConstraints = army.upgradeConstraints ?? [];
  const magicConstraints = magic ? magicItems.upgradeConstraints : [];
  const upgradeConstraints = [...armyConstraints, ...magicConstraints];

  // upgrades are needed by units, so build them first
  const upgrades = buildUpgrades(army.upgrades, magic ? magicItems.upgrades : undefined);
  const units = applyForceMinimums(buildUnits(army.units, upgradeConstraints), DEFAULT_GAME_SIZE);

  return {
    ...emptyData(),
    armyId: id,
    army,
    units,
    upgrades,
    magic,
    specialRules: army.specialRules,
    spells: army.spells,
    version: army.version,
    errors: validate(units, upgrades, DEFAULT_GAME_SIZE),
  };
};
