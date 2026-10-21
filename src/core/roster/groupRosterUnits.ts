import type { UnitState } from "@/core/army-state/types";
import { isCharacter } from "@/core/army-state/unitTypes";
import { matchesQuery } from "@/core/lib/textSearch";
import { resolveBounds } from "@/core/limits/forceLimits";

const TROOP_TYPE_ORDER = [
  "Infantry",
  "Cavalry",
  "Chariot",
  "Monster",
  "Artillery",
  "Machine",
  "Special",
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
 * the units map. An optional `query` filters by unit display name (see
 * `matchesQuery`); groups left empty by the filter are dropped.
 */
export const groupRosterUnits = (
  units: Record<string, UnitState>,
  query = "",
  gameSize?: number,
): RosterGroup[] => {
  const matches = (id: string) => matchesQuery(units[id].name, query);

  const characters: string[] = [];
  const troops: Record<string, string[]> = {};

  for (const id of Object.keys(units)) {
    if (!matches(id)) {
      continue;
    }

    const type = units[id].type;

    if (isCharacter(type)) {
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

    const mandatory = ids.filter(
      (id) => resolveBounds(units[id], gameSize).min > 0,
    );
    const rest = ids.filter(
      (id) => resolveBounds(units[id], gameSize).min === 0,
    );

    return [...mandatory, ...rest];
  };

  const groups: RosterGroup[] = [];

  if (characters.length > 0) {
    groups.push({
      label: "Characters",
      unitIds: sortMandatoryFirst(characters),
    });
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
