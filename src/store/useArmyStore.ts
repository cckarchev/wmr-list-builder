import { create } from 'zustand';

import { loadArmy } from '../data/loadArmy';
import { magicItems } from '../data/magicItems';
import type { Army, Spell, UpgradeConstraint, ValidationError } from '../data/types';
import { buildUnits, buildUpgrades, unitPointsCost, unitUpgradePointsCost } from './storeHelpers';
import type { UnitState, UpgradeState, UnitUpgradeEntry } from './storeHelpers';
import { validate } from './validation';
import { resolveBounds, applyForceMinimums } from './forceLimits';
import type { ListSnapshot } from './persistence';

export const DEFAULT_GAME_SIZE = 2000;

export type { UnitState, UpgradeState, UnitUpgradeEntry } from './storeHelpers';

export interface ArmyState {
  // data
  armyId: string | null;
  army: Army | null;
  units: Record<string, UnitState>;
  upgrades: Record<string, UpgradeState>;
  upgradeConstraints: UpgradeConstraint[];
  magic: boolean;
  specialRules: Army['specialRules'];
  spells: Spell[] | undefined;
  version: string;
  label: string;
  errors: ValidationError[];
  gameSize: number;
  loadWarning: string | null;
  savedBaseline: string | null;

  // actions
  setArmy: (id: string) => void;
  setUnitNumber: (unitID: string, number: number) => void;
  setUnitUpgradeNumber: (unitID: string, upgradeID: string, number: number) => void;
  setLabel: (label: string) => void;
  setGameSize: (n: number) => void;
  setLoadWarning: (msg: string | null) => void;
  setSavedBaseline: (encoded: string | null) => void;
  applyList: (snap: ListSnapshot) => void;
  reset: () => void;
}

interface InitialData {
  armyId: string | null;
  army: Army | null;
  units: Record<string, UnitState>;
  upgrades: Record<string, UpgradeState>;
  upgradeConstraints: UpgradeConstraint[];
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

function emptyData(): InitialData {
  return {
    armyId: null,
    army: null,
    units: {},
    upgrades: {},
    upgradeConstraints: [],
    magic: false,
    specialRules: undefined,
    spells: undefined,
    version: '',
    label: '',
    errors: [],
    gameSize: DEFAULT_GAME_SIZE,
    loadWarning: null,
    savedBaseline: null,
  };
}

/**
 * Port of `initializeState` (actions.js 342-396) for the Revolution-only data
 * layer. Builds the full state object for an army id.
 */
function initializeState(id: string): InitialData {
  const army = loadArmy(id);

  let upgradeConstraints: UpgradeConstraint[] = army.upgradeConstraints
    ? [...army.upgradeConstraints]
    : [];
  const magic = !!army.magic;

  if (magic) {
    upgradeConstraints = upgradeConstraints.concat(magicItems.upgradeConstraints);
  }

  // upgrades are needed by units, so build them first
  const upgrades = buildUpgrades(army.upgrades, magic ? magicItems.upgrades : undefined);
  const units = applyForceMinimums(buildUnits(army.units, upgradeConstraints), DEFAULT_GAME_SIZE);

  return {
    armyId: id,
    army,
    units,
    upgrades,
    upgradeConstraints,
    magic,
    specialRules: army.specialRules,
    spells: army.spells,
    version: army.version,
    label: '',
    errors: validate(units, upgrades, DEFAULT_GAME_SIZE),
    gameSize: DEFAULT_GAME_SIZE,
    loadWarning: null,
    savedBaseline: null,
  };
}

export const useArmyStore = create<ArmyState>((set, get) => ({
  ...emptyData(),

  setArmy: (id) => {
    set(initializeState(id));
  },

  setUnitNumber: (unitID, number) => {
    set((state) => {
      const units = { ...state.units };
      const upgrades = { ...state.upgrades };
      const existing = units[unitID];

      // clamp to the unit's resolved hard force limits at the current cap.
      let n = +number;
      if (!Number.isFinite(n) || n < 0) n = 0;
      const { min, max } = existing
        ? resolveBounds(existing, state.gameSize)
        : { min: 0, max: undefined };
      if (n < min) n = min;
      if (max !== undefined && n > max) n = max;

      const unit: UnitState = { ...existing, number: n };

      // reduce any of this unit's upgrades whose number exceeds the new unit
      // number, keeping the global upgrade total in sync.
      if (unit.upgrades) {
        const newUnitUpgrades: Record<string, UnitUpgradeEntry> = { ...unit.upgrades };
        for (const upgradeID in newUnitUpgrades) {
          if (newUnitUpgrades[upgradeID].number > n) {
            applyUnitUpgradeNumber(upgrades, unit, newUnitUpgrades, upgradeID, n);
          }
        }
        unit.upgrades = newUnitUpgrades;
      }

      unit.pointsCost = unitPointsCost(unit);
      units[unitID] = unit;

      return { units, upgrades, errors: validate(units, upgrades, state.gameSize) };
    });
  },

  setUnitUpgradeNumber: (unitID, upgradeID, number) => {
    set((state) => {
      const units = { ...state.units };
      const upgrades = { ...state.upgrades };

      const unit: UnitState = { ...units[unitID] };
      const newUnitUpgrades: Record<string, UnitUpgradeEntry> = { ...(unit.upgrades || {}) };

      applyUnitUpgradeNumber(upgrades, unit, newUnitUpgrades, upgradeID, number);

      unit.upgrades = newUnitUpgrades;
      unit.pointsCost = unitPointsCost(unit);
      units[unitID] = unit;

      return { units, upgrades, errors: validate(units, upgrades, state.gameSize) };
    });
  },

  setLabel: (label) => set({ label }),

  setLoadWarning: (loadWarning) => set({ loadWarning }),

  setSavedBaseline: (savedBaseline) => set({ savedBaseline }),

  setGameSize: (n) =>
    set((state) => {
      let next = Math.floor(+n);
      if (!Number.isFinite(next) || next < 0) next = 0;
      return { gameSize: next, errors: validate(state.units, state.upgrades, next) };
    }),

  applyList: (snap) => {
    const { setGameSize, setLabel, setUnitNumber, setUnitUpgradeNumber, units } = get();
    setGameSize(snap.gameSize);
    setLabel(snap.name);
    for (const [unitID, n] of Object.entries(snap.units)) {
      if (units[unitID]) setUnitNumber(unitID, n);
    }
    for (const [unitID, ups] of Object.entries(snap.upgrades)) {
      if (!units[unitID]) continue;
      for (const [upgradeID, n] of Object.entries(ups)) {
        if (get().upgrades[upgradeID]) setUnitUpgradeNumber(unitID, upgradeID, n);
      }
    }
  },

  reset: () => set(emptyData()),
}));

/**
 * Shared core of `setUnitUpgradeNumber` (actions.js 127-172). Mutates the
 * provided `unit`, its `newUnitUpgrades` map, and the `upgrades` map (global
 * totals) in place.
 *
 * - clamps `number` to [0, unit.number]
 * - handles `addOnUpgrades` (add the add-on upgrades when going 0->>0, remove
 *   when going >0->0)
 * - updates the global upgrade total by the delta
 * - sets the unit-upgrade number + pointsCost
 *
 * The caller recomputes the unit's overall pointsCost afterwards (mirroring
 * the Vue `skipSettingUnitPointsCost` flow).
 */
function applyUnitUpgradeNumber(
  upgrades: Record<string, UpgradeState>,
  unit: UnitState,
  newUnitUpgrades: Record<string, UnitUpgradeEntry>,
  upgradeID: string,
  number: number,
): void {
  let n = +number;
  if (n < 0) n = 0;
  if (n > unit.number) n = unit.number;

  const upgrade = { ...upgrades[upgradeID] };

  // addOnUpgrades: add/remove dependent upgrades on this unit
  if (upgrade.addOnUpgrades) {
    if (n <= 0) {
      upgrade.addOnUpgrades.forEach((addOnID) => {
        delete newUnitUpgrades[addOnID];
      });
    } else if (upgrade.number === 0) {
      upgrade.addOnUpgrades.forEach((addOnID) => {
        newUnitUpgrades[addOnID] = { number: 0, pointsCost: 0 };
      });
    }
  }

  const previousUnitNumber = newUnitUpgrades[upgradeID]?.number ?? 0;

  // update the global upgrade total by the delta of this change
  upgrade.number = upgrade.number - previousUnitNumber + n;
  upgrades[upgradeID] = upgrade;

  // set the unit-upgrade number + pointsCost
  newUnitUpgrades[upgradeID] = {
    number: n,
    pointsCost: unitUpgradePointsCost(upgrade, unit, n),
  };
}
