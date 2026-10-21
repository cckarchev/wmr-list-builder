import { describe, expect, it } from "vitest";
import { takenMagicItems } from "./takenMagicItems";

const SWORD = { id: "sword", name: "Sword of Might", text: [] };
const BANNER = { id: "banner", name: "Banner of Battle", text: [] };
const CATALOG = { sword: SWORD, banner: BANNER };

describe("takenMagicItems", () => {
  it("returns the catalog items that are taken at least once", () => {
    const upgrades = {
      sword: { number: 1, type: "Magic Weapon" },
      banner: { number: 0, type: "Magic Standard" },
    };

    expect(takenMagicItems(upgrades, CATALOG)).toEqual([["sword", SWORD]]);
  });

  it("ignores taken upgrades that are not magic items", () => {
    const upgrades = { sword: { number: 1, type: "Monster" } };

    expect(takenMagicItems(upgrades, CATALOG)).toEqual([]);
  });

  it("is empty when nothing is taken", () => {
    expect(takenMagicItems({}, CATALOG)).toEqual([]);
  });
});
