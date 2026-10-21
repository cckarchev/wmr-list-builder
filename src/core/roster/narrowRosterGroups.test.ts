import { describe, expect, it } from "vitest";
import { narrowRosterGroups } from "./narrowRosterGroups";

const GROUPS = [
  { label: "Characters", unitIds: ["general", "hero"] },
  { label: "Infantry", unitIds: ["spearmen", "archers"] },
];

const NUMBERS: Record<string, number> = {
  general: 1,
  hero: 0,
  spearmen: 0,
  archers: 2,
};

const SELECTED_COUNT = (id: string) => NUMBERS[id];

describe("narrowRosterGroups", () => {
  it("keeps every group when no filter is active", () => {
    const result = narrowRosterGroups(GROUPS, {
      activeType: null,
      selectedOnly: false,
      countOf: SELECTED_COUNT,
    });

    expect(result).toEqual(GROUPS);
  });

  it("keeps only the active type", () => {
    const result = narrowRosterGroups(GROUPS, {
      activeType: "Infantry",
      selectedOnly: false,
      countOf: SELECTED_COUNT,
    });

    expect(result.map((group) => group.label)).toEqual(["Infantry"]);
  });

  it("keeps only selected units when selectedOnly is on", () => {
    const result = narrowRosterGroups(GROUPS, {
      activeType: null,
      selectedOnly: true,
      countOf: SELECTED_COUNT,
    });

    expect(result).toEqual([
      { label: "Characters", unitIds: ["general"] },
      { label: "Infantry", unitIds: ["archers"] },
    ]);
  });

  it("drops groups left empty by the filters", () => {
    const result = narrowRosterGroups(GROUPS, {
      activeType: "Characters",
      selectedOnly: true,
      countOf: (id) => (id === "archers" ? 1 : 0),
    });

    expect(result).toEqual([]);
  });
});
