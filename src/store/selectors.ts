import type { ArmyState } from './useArmyStore';
import type { UnitState, UpgradeState, UnitUpgradeEntry } from './storeHelpers';
import type { ValidationError } from '../data/types';
import { resolveBounds } from './forceLimits';

const COUNTABLE_UNITS = [
  'Artillery',
  'Cavalry',
  'Chariot',
  'Elephant',
  'Infantry',
  'Machine',
  'Monster',
];

/** Port of getters.js `pointsCost`: Σ over units of unit.pointsCost. */
export function pointsCost(state: Pick<ArmyState, 'units'>): number {
  return Object.values(state.units).reduce((sum, unit) => sum + +unit.pointsCost, 0);
}

/** Port of getters.js `size`: Math.max(1, Math.floor(points / 1000)). */
export function armySize(points: number): number {
  return Math.max(1, Math.floor(points / 1000));
}

/** Port of getters.js `unitCount`, including the Skirmish logic. */
export function unitCount(units: Record<string, UnitState>): number {
  let skirmishCount = 0;
  let unarmouredSkirmishCount = 0;

  const count = Object.values(units).reduce((acc, unit) => {
    if (COUNTABLE_UNITS.includes(unit.type)) {
      if (!unit.noCount) {
        acc += unit.number;
      }

      if (unit.specialRules && unit.specialRules.includes('Skirmish')) {
        skirmishCount += unit.number;

        if (!unit.armour) {
          unarmouredSkirmishCount += unit.number;
        }
      }
    }

    return acc;
  }, 0);

  return skirmishCount > count - skirmishCount ? count : count - unarmouredSkirmishCount;
}

/** Units an army can lose before it must withdraw: half its countable units, rounded up. */
export function breakPoint(units: Record<string, UnitState>): number {
  return Math.ceil(unitCount(units) / 2);
}

export type UsedUnit = Omit<UnitState, 'upgrades'> & {
  upgrades?: Record<string, UpgradeState & UnitUpgradeEntry>;
};

/** Port of getters.js `usedUnits`: units with number > 0, with used upgrades merged. */
export function usedUnits(state: Pick<ArmyState, 'units' | 'upgrades'>): Record<string, UsedUnit> {
  return Object.keys(state.units).reduce<Record<string, UsedUnit>>((acc, unitID) => {
    const unit = state.units[unitID];
    if (unit.number > 0) {
      const { upgrades, ...rest } = unit;
      const used: UsedUnit = { ...rest };

      if (upgrades) {
        used.upgrades = Object.keys(upgrades)
          .filter((upgradeID) => upgrades[upgradeID].number > 0)
          .reduce<Record<string, UpgradeState & UnitUpgradeEntry>>((upAcc, upgradeID) => {
            upAcc[upgradeID] = { ...state.upgrades[upgradeID], ...upgrades[upgradeID] };
            return upAcc;
          }, {});
      }

      acc[unitID] = used;
    }
    return acc;
  }, {});
}

/** Errors attributed to a given unit/upgrade id, for inline rendering. */
export function errorsForTarget(errors: ValidationError[], id: string): ValidationError[] {
  return errors.filter((e) => e.targets.includes(id));
}

/** List-level errors with no specific target (e.g. the points ceiling). */
export function globalErrors(errors: ValidationError[]): ValidationError[] {
  return errors.filter((e) => e.targets.length === 0);
}

const CHARACTER_TYPES = ['General', 'Hero', 'Wizard'];

/** A character is a General, Hero, or Wizard (the units that carry a Command value). */
export function isCharacter(type: string): boolean {
  return CHARACTER_TYPES.includes(type);
}

/**
 * A unit can cast the army's spells if it's a Wizard or is data-flagged as a
 * `caster` (a General/Hero granted spellcasting by a special rule, e.g. the
 * Skaven Grey Seer).
 */
export function isCaster(unit: { type: string; caster?: boolean }): boolean {
  return unit.type === 'Wizard' || unit.caster === true;
}

const TROOP_TYPE_ORDER = [
  'Infantry',
  'Cavalry',
  'Chariot',
  'Monster',
  'Artillery',
  'Machine',
  'Special',
];

export interface RosterGroup {
  label: string;
  unitIds: string[];
}

/**
 * Group roster units for display: a single "Characters" group
 * (General/Hero/Wizard) first, then troop groups in canonical type order.
 * Within each group, mandatory units (those with a resolved minimum > 0 at the
 * given `gameSize`) are floated to the top; order is otherwise stable, following
 * the units map. An optional case-insensitive `query` filters by unit id (its
 * display name); groups left empty by the filter are dropped.
 */
export function groupRosterUnits(
  units: Record<string, UnitState>,
  query = '',
  gameSize?: number,
): RosterGroup[] {
  const q = query.trim().toLowerCase();
  const matches = (id: string) => !q || id.toLowerCase().includes(q);

  const characters: string[] = [];
  const troops: Record<string, string[]> = {};

  for (const id of Object.keys(units)) {
    if (!matches(id)) continue;
    const type = units[id].type;
    if (CHARACTER_TYPES.includes(type)) {
      characters.push(id);
    } else {
      (troops[type] ??= []).push(id);
    }
  }

  // Float mandatory units (resolved min > 0) to the top of each group. A stable
  // partition preserves the units map's relative order within each partition.
  const sortMandatoryFirst = (ids: string[]) => {
    if (gameSize === undefined) return ids;
    const mandatory = ids.filter((id) => resolveBounds(units[id], gameSize).min > 0);
    const rest = ids.filter((id) => resolveBounds(units[id], gameSize).min === 0);
    return [...mandatory, ...rest];
  };

  const groups: RosterGroup[] = [];
  if (characters.length)
    groups.push({ label: 'Characters', unitIds: sortMandatoryFirst(characters) });
  for (const type of TROOP_TYPE_ORDER) {
    if (troops[type]?.length)
      groups.push({ label: type, unitIds: sortMandatoryFirst(troops[type]) });
  }
  // Surface any unforeseen type so units are never silently hidden.
  for (const type of Object.keys(troops)) {
    if (!TROOP_TYPE_ORDER.includes(type))
      groups.push({ label: type, unitIds: sortMandatoryFirst(troops[type]) });
  }
  return groups;
}
