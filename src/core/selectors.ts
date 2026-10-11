import type { ValidationError } from '@/data/types';
import type { ArmyState } from '@/store/useArmyStore';
import { resolveBounds } from './forceLimits';
import type { UnitState, UnitUpgradeEntry, UpgradeState } from './storeHelpers';

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
export const pointsCost = (state: Pick<ArmyState, 'units'>): number =>
  Object.values(state.units).reduce((sum, unit) => sum + +unit.pointsCost, 0);

/** Points in one army-size step; per-1,000-point limits scale with each step. */
export const POINTS_PER_ARMY_SIZE = 1000;

/** Port of getters.js `size`: Math.max(1, Math.floor(points / 1000)). */
export const armySize = (points: number): number =>
  Math.max(1, Math.floor(points / POINTS_PER_ARMY_SIZE));

/** Units that count toward the break point: every countable type, except `noCount` units. */
export const unitCount = (units: Record<string, UnitState>): number => {
  let count = 0;

  for (const unit of Object.values(units)) {
    const counts = COUNTABLE_UNITS.includes(unit.type) && !unit.noCount;

    if (counts) {
      count += unit.number;
    }
  }

  return count;
};

/** Units an army can lose before it must withdraw: half its countable units, rounded up. */
export const breakPoint = (units: Record<string, UnitState>): number =>
  Math.ceil(unitCount(units) / 2);

export type UsedUnit = Omit<UnitState, 'upgrades'> & {
  upgrades?: Record<string, UpgradeState & UnitUpgradeEntry>;
};

/** Port of getters.js `usedUnits`: units with number > 0, with used upgrades merged. */
export const usedUnits = (state: Pick<ArmyState, 'units' | 'upgrades'>): Record<string, UsedUnit> =>
  Object.keys(state.units).reduce<Record<string, UsedUnit>>((acc, unitId) => {
    const unit = state.units[unitId];
    if (unit.number > 0) {
      const { upgrades, ...rest } = unit;
      const used: UsedUnit = { ...rest };

      if (upgrades) {
        used.upgrades = Object.keys(upgrades)
          .filter((upgradeId) => upgrades[upgradeId].number > 0)
          .reduce<Record<string, UpgradeState & UnitUpgradeEntry>>((upAcc, upgradeId) => {
            upAcc[upgradeId] = { ...state.upgrades[upgradeId], ...upgrades[upgradeId] };
            return upAcc;
          }, {});
      }

      acc[unitId] = used;
    }
    return acc;
  }, {});

/** Errors attributed to a given unit/upgrade id, for inline rendering. */
export const errorsForTarget = (errors: ValidationError[], id: string): ValidationError[] =>
  errors.filter((e) => e.targets.includes(id));

/** List-level errors with no specific target (e.g. the points ceiling). */
export const globalErrors = (errors: ValidationError[]): ValidationError[] =>
  errors.filter((e) => e.targets.length === 0);

const CHARACTER_TYPES = ['General', 'Hero', 'Wizard'];

/** A character is a General, Hero, or Wizard (the units that carry a Command value). */
export const isCharacter = (type: string): boolean => CHARACTER_TYPES.includes(type);

/**
 * A unit can cast the army's spells if it's a Wizard or is data-flagged as a
 * `caster` (a General/Hero granted spellcasting by a special rule, e.g. the
 * Skaven Grey Seer).
 */
export const isCaster = (unit: { type: string; caster?: boolean }): boolean =>
  unit.type === 'Wizard' || unit.caster === true;

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
 * the units map. An optional case-insensitive `query` filters by unit display
 * name; groups left empty by the filter are dropped.
 */
export const groupRosterUnits = (
  units: Record<string, UnitState>,
  query = '',
  gameSize?: number,
): RosterGroup[] => {
  const q = query.trim().toLowerCase();
  const matches = (id: string) => !q || units[id].name.toLowerCase().includes(q);

  const characters: string[] = [];
  const troops: Record<string, string[]> = {};

  for (const id of Object.keys(units)) {
    if (!matches(id)) {
      continue;
    }
    const type = units[id].type;
    if (CHARACTER_TYPES.includes(type)) {
      characters.push(id);
    } else {
      troops[type] ??= [];
      troops[type].push(id);
    }
  }

  // Float mandatory units (resolved min > 0) to the top of each group. A stable
  // partition preserves the units map's relative order within each partition.
  const sortMandatoryFirst = (ids: string[]) => {
    if (gameSize === undefined) {
      return ids;
    }
    const mandatory = ids.filter((id) => resolveBounds(units[id], gameSize).min > 0);
    const rest = ids.filter((id) => resolveBounds(units[id], gameSize).min === 0);
    return [...mandatory, ...rest];
  };

  const groups: RosterGroup[] = [];
  if (characters.length > 0) {
    groups.push({ label: 'Characters', unitIds: sortMandatoryFirst(characters) });
  }
  for (const type of TROOP_TYPE_ORDER) {
    if (troops[type]?.length) {
      groups.push({ label: type, unitIds: sortMandatoryFirst(troops[type]) });
    }
  }
  // Surface any unforeseen type so units are never silently hidden.
  for (const type of Object.keys(troops)) {
    if (!TROOP_TYPE_ORDER.includes(type)) {
      groups.push({ label: type, unitIds: sortMandatoryFirst(troops[type]) });
    }
  }
  return groups;
};
