import { describe, expect, it } from "vitest";
import { armyIdsMissingFrom, orphanArmyIds } from "./armyKeyedRecord";

const ARMY_IDS = ["goblin", "orcs"];

describe("armyIdsMissingFrom", () => {
  it("lists the armies the record has no entry for", () => {
    expect(armyIdsMissingFrom({ goblin: "x" }, ARMY_IDS)).toEqual(["orcs"]);
  });

  it("is empty when every army has an entry", () => {
    expect(armyIdsMissingFrom({ goblin: "x", orcs: "y" }, ARMY_IDS)).toEqual(
      [],
    );
  });
});

describe("orphanArmyIds", () => {
  it("lists the record keys that name no army", () => {
    expect(
      orphanArmyIds({ goblin: "x", "not-an-army": "y" }, ARMY_IDS),
    ).toEqual(["not-an-army"]);
  });

  it("is empty when every key names an army", () => {
    expect(orphanArmyIds({ goblin: "x" }, ARMY_IDS)).toEqual([]);
  });
});
