import { create } from 'zustand';

import { loadArmy } from '../data/loadArmy';
import magicItemsFile from '../data/magic-items.revolution.json';
import type { Army, MagicItemsFile, Spell, UpgradeConstraint, ValidationError } from '../data/types';
import {
  buildUnits,
  buildUpgrades,
  unitPointsCost,
  unitUpgradePointsCost,
} from './storeHelpers';
import type { UnitState, UpgradeState, UnitUpgradeEntry } from './storeHelpers';
import { validate } from './validation';

export type { UnitState, UpgradeState, UnitUpgradeEntry } from './storeHelpers';

const magicItems = magicItemsFile as MagicItemsFile;

export interface PrintableItem {
  abbr: string;
  title: string;
}

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
  printItems: PrintableItem[];
  printableItems: PrintableItem[];
  errors: ValidationError[];

  // actions
  setArmy: (id: string) => void;
  setUnitNumber: (unitID: string, number: number) => void;
  setUnitUpgradeNumber: (unitID: string, upgradeID: string, number: number) => void;
  setLabel: (label: string) => void;
  addPrintItem: (index: number) => void;
  removePrintItem: (index: number) => void;
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
  printItems: PrintableItem[];
  printableItems: PrintableItem[];
  errors: ValidationError[];
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
    printItems: [],
    printableItems: [],
    errors: [],
  };
}

/**
 * Port of `initializeState` (actions.js 342-396) for the Revolution-only data
 * layer. Builds the full state object for an army id.
 */
function initializeState(id: string): InitialData {
  const army = loadArmy(id);

  const printableItems: PrintableItem[] = [
    { abbr: 'l', title: 'Text List' },
    { abbr: 's', title: 'Stats' },
    { abbr: 'sl', title: 'Stats Used' },
  ];

  if (army.armyRules) {
    printableItems.push({ abbr: 'ar', title: 'Army Rules' });
  }

  if (army.specialRules) {
    printableItems.push({ abbr: 'sr', title: 'Special Rules' });
    printableItems.push({ abbr: 'sru', title: 'Special Rules Used' });
  }

  let upgradeConstraints: UpgradeConstraint[] = army.upgradeConstraints
    ? [...army.upgradeConstraints]
    : [];
  const magic = !!army.magic;

  if (magic) {
    upgradeConstraints = upgradeConstraints.concat(magicItems.upgradeConstraints);

    printableItems.push({ abbr: 'mi', title: 'Magic Items' });
    printableItems.push({ abbr: 'miu', title: 'Magic Items Used' });
    printableItems.push({ abbr: 'sp', title: 'Spells' });
  }

  // upgrades are needed by units, so build them first
  const upgrades = buildUpgrades(army.upgrades, magic ? magicItems.upgrades : undefined);
  const units = buildUnits(army.units, upgradeConstraints);

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
    printItems: [],
    printableItems,
    errors: validate(units, upgrades),
  };
}

export const useArmyStore = create<ArmyState>((set) => ({
  ...emptyData(),

  setArmy: (id) => {
    set(initializeState(id));
  },

  setUnitNumber: (unitID, number) => {
    // clamp to >= 0 (port of actions.js setUnitNumber, sans validation)
    let n = +number;
    if (n < 0) n = 0;

    set((state) => {
      const units = { ...state.units };
      const upgrades = { ...state.upgrades };

      const unit: UnitState = { ...units[unitID], number: n };

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

      return { units, upgrades, errors: validate(units, upgrades) };
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

      return { units, upgrades, errors: validate(units, upgrades) };
    });
  },

  setLabel: (label) => set({ label }),

  addPrintItem: (index) =>
    set((state) => {
      const printableItems = [...state.printableItems];
      const [moved] = printableItems.splice(index, 1);
      if (!moved) return {};
      return { printItems: [...state.printItems, moved], printableItems };
    }),

  removePrintItem: (index) =>
    set((state) => {
      const printItems = [...state.printItems];
      const [moved] = printItems.splice(index, 1);
      if (!moved) return {};
      return { printItems, printableItems: [...state.printableItems, moved] };
    }),

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
