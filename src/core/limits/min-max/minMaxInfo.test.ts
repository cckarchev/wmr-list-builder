import { describe, expect, it } from "vitest";
import { isExact, linkedUnit, resolveMinMax } from "./minMaxInfo";

const TWO_STEPS = 2000;
const STEPS = 2;

describe("resolveMinMax", () => {
  it("prefers absolute army counts over everything else", () => {
    const armyMax = 1;

    expect(resolveMinMax({ armyMax, max: "elite" }, TWO_STEPS)).toEqual({
      kind: "army",
      min: undefined,
      max: armyMax,
    });
  });

  it("resolves elite to a cap from the army size", () => {
    const eliteCapAtTwoSteps = 1;

    expect(resolveMinMax({ max: "elite" }, TWO_STEPS)).toEqual({
      kind: "elite",
      cap: eliteCapAtTwoSteps,
    });
  });

  it("passes other keyword tokens through, min first", () => {
    expect(
      resolveMinMax({ min: "As Knights", max: "Half" }, TWO_STEPS),
    ).toEqual({
      kind: "token",
      token: "As Knights",
    });
    expect(resolveMinMax({ max: "Half or None" }, TWO_STEPS)).toEqual({
      kind: "token",
      token: "Half or None",
    });
  });

  it("reads numeric limits as a per-1,000-point rate", () => {
    const max = 3;

    expect(resolveMinMax({ max }, TWO_STEPS)).toEqual({
      kind: "rate",
      min: 0,
      max,
      size: STEPS,
    });
  });

  it("has nothing to say about a troop without limits", () => {
    expect(resolveMinMax({}, TWO_STEPS)).toBeUndefined();
  });
});

describe("linkedUnit", () => {
  it('names the unit an "As X" token ties to', () => {
    expect(linkedUnit("As Knights")).toBe("Knights");
  });

  it("is undefined for keyword tokens", () => {
    expect(linkedUnit("Half or None")).toBeUndefined();
  });
});

describe("isExact", () => {
  it("holds when min and max are the same count", () => {
    expect(isExact({ kind: "army", min: 1, max: 1 })).toBe(true);
  });

  it("fails for a range or a bare maximum", () => {
    const max = 2;

    expect(isExact({ kind: "army", min: 1, max })).toBe(false);
    expect(isExact({ kind: "army", max })).toBe(false);
  });
});
