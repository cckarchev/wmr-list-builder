import { describe, expect, it } from "vitest";
import { initializeState } from "../armyData";
import {
  withGameSize,
  withUnitNumber,
  withUnitUpgradeNumber,
} from "./transitions";

// Behavior is covered through the store in useArmyStore.test.ts. These pin the
// contract the store relies on: a transition returns new data and leaves the
// state it was given untouched, so zustand sees a change.

const HALBERDIERS = 5;
const FRACTIONAL_GAME = 1500.7;
const WHOLE_GAME = 1500;

describe("transitions", () => {
  it("withUnitNumber leaves the given state untouched", () => {
    const state = initializeState("empire");
    const before = structuredClone(state);

    const next = withUnitNumber(state, "halberdiers", HALBERDIERS);

    expect(state).toEqual(before);
    expect(next.units?.halberdiers.number).toBe(HALBERDIERS);
  });

  it("withUnitUpgradeNumber leaves the given state untouched", () => {
    const state = initializeState("empire");
    const sized = {
      ...state,
      ...withUnitNumber(state, "halberdiers", HALBERDIERS),
    };
    const before = structuredClone(sized);

    const next = withUnitUpgradeNumber(sized, "halberdiers", "battleBanner", 1);

    expect(sized).toEqual(before);
    expect(next.units?.halberdiers.upgrades?.battleBanner.number).toBe(1);
    expect(next.upgrades?.battleBanner.number).toBe(1);
  });

  it("withGameSize floors a fractional size to whole points", () => {
    const state = initializeState("empire");

    const next = withGameSize(state, FRACTIONAL_GAME);

    expect(next.gameSize).toBe(WHOLE_GAME);
  });
});
