import { describe, expect, it } from "vitest";
import { specialRuleMarkers } from "./specialRuleMarkers";

const RULES = {
  knights: { order: 3 },
  fear: { order: 1 },
  fly: {},
};

describe("specialRuleMarkers", () => {
  it("returns an empty string when no name has a numbered rule", () => {
    expect(specialRuleMarkers(["spearmen", "fly"], RULES)).toBe("");
  });

  it("marks each numbered rule with an asterisk", () => {
    expect(specialRuleMarkers(["knights"], RULES)).toBe("*3");
  });

  it("sorts the markers by their rule number", () => {
    expect(specialRuleMarkers(["knights", "fly", "fear"], RULES)).toBe(
      "*1, *3",
    );
  });
});
