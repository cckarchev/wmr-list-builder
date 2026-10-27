import { describe, expect, it } from "vitest";
import { armySize, POINTS_PER_ARMY_SIZE } from "./armySize";

const JUST_UNDER_ONE_STEP = 999;
const TWO_AND_A_HALF_STEPS = 2500;
const THREE_STEPS = 3000;

describe("armySize", () => {
  it("is at least 1", () => {
    expect(armySize(0)).toBe(1);
    expect(armySize(JUST_UNDER_ONE_STEP)).toBe(1);
  });

  it("grows per 1000 points", () => {
    expect(armySize(TWO_AND_A_HALF_STEPS)).toBe(2);
    expect(armySize(THREE_STEPS)).toBe(THREE_STEPS / POINTS_PER_ARMY_SIZE);
  });
});
