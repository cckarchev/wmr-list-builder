import { describe, expect, it } from "vitest";
import { snapshotOf } from "./snapshot";

describe("snapshotOf", () => {
  it("captures only non-zero counts", () => {
    const state = {
      label: "",
      gameSize: 2000,
      units: {
        general: { number: 1, upgrades: { sword: { number: 1 } } },
        knights: { number: 0, upgrades: {} },
      },
    } as never;

    expect(snapshotOf(state)).toEqual({
      name: "",
      gameSize: 2000,
      units: { general: 1 },
      upgrades: { general: { sword: 1 } },
    });
  });
});
