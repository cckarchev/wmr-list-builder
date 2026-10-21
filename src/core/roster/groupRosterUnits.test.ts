import { describe, expect, it } from "vitest";
import type { UnitState } from "@/core/army-state/types";
import { DEFAULT_GAME_SIZE } from "@/store/armyData";
import { groupRosterUnits } from "./groupRosterUnits";

/** Build a minimal units map keyed in insertion order, each unit named after its key. */
const unitsOf = (entries: [string, string][]): Record<string, UnitState> => {
  const map: Record<string, UnitState> = {};

  for (const [id, type] of entries) {
    map[id] = { name: id, type } as UnitState;
  }

  return map;
};

const units = unitsOf([
  ["Goblin Warboss", "General"],
  ["Goblin Bigboss", "Hero"],
  ["Shaman", "Wizard"],
  ["Goblins", "Infantry"],
  ["Spider Riders", "Infantry"],
  ["Wolf Riders", "Cavalry"],
  ["Wolf Chariots", "Chariot"],
  ["Giant", "Monster"],
  ["Doom Diver", "Artillery"],
  ["Pump Wagon", "Machine"],
]);

describe("groupRosterUnits ordering", () => {
  it("groups characters first, then troop types in canonical order", () => {
    const groups = groupRosterUnits(units);

    expect(groups.map((g) => g.label)).toEqual([
      "Characters",
      "Infantry",
      "Cavalry",
      "Chariot",
      "Monster",
      "Artillery",
      "Machine",
    ]);
  });

  it("folds General/Hero/Wizard into one Characters group, preserving order", () => {
    const groups = groupRosterUnits(units);
    const characters = groups.find((g) => g.label === "Characters");

    expect(characters?.unitIds).toEqual([
      "Goblin Warboss",
      "Goblin Bigboss",
      "Shaman",
    ]);
  });

  it("preserves existing order within a troop group", () => {
    const groups = groupRosterUnits(units);
    const infantry = groups.find((g) => g.label === "Infantry");

    expect(infantry?.unitIds).toEqual(["Goblins", "Spider Riders"]);
  });
});

describe("groupRosterUnits filtering", () => {
  it("filters by a case-insensitive name query, dropping now-empty groups", () => {
    const groups = groupRosterUnits(units, "wolf");

    expect(groups.map((g) => g.label)).toEqual(["Cavalry", "Chariot"]);
    expect(groups.flatMap((g) => g.unitIds)).toEqual([
      "Wolf Riders",
      "Wolf Chariots",
    ]);
  });

  it("matches the query against the display name, not the id", () => {
    const named = {
      wr: { name: "Wolf Riders", type: "Cavalry" } as UnitState,
      gob: { name: "Goblins", type: "Infantry" } as UnitState,
    };

    expect(groupRosterUnits(named, "wolf").flatMap((g) => g.unitIds)).toEqual([
      "wr",
    ]);
    expect(groupRosterUnits(named, "wr")).toEqual([]);
  });

  it("returns no groups when the query matches nothing", () => {
    expect(groupRosterUnits(units, "dragon")).toEqual([]);
  });

  it("ignores surrounding whitespace in the query", () => {
    const groups = groupRosterUnits(units, "  giant  ");

    expect(groups.map((g) => g.label)).toEqual(["Monster"]);
  });
});

describe("groupRosterUnits with mandatory units", () => {
  it("floats mandatory units (resolved min > 0) to the top of their group when a gameSize is given", () => {
    const mandatoryUnits: Record<string, UnitState> = {
      goblins: { type: "Infantry" } as UnitState,
      goblinHorde: { type: "Infantry", armyMin: 1 } as UnitState,
      spiderRiders: { type: "Infantry" } as UnitState,
    };
    const infantry = groupRosterUnits(
      mandatoryUnits,
      "",
      DEFAULT_GAME_SIZE,
    ).find((g) => g.label === "Infantry");

    expect(infantry?.unitIds).toEqual([
      "goblinHorde",
      "goblins",
      "spiderRiders",
    ]);
  });

  it("keeps the units-map order when no gameSize is given", () => {
    const mandatoryUnits: Record<string, UnitState> = {
      goblins: { type: "Infantry" } as UnitState,
      goblinHorde: { type: "Infantry", armyMin: 1 } as UnitState,
    };
    const infantry = groupRosterUnits(mandatoryUnits).find(
      (g) => g.label === "Infantry",
    );

    expect(infantry?.unitIds).toEqual(["goblins", "goblinHorde"]);
  });
});
