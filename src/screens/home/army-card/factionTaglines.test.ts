import { describe, expect, it } from "vitest";
import { armyIndex } from "@/data/armyIndex";
import { armyIdsMissingFrom, orphanArmyIds } from "@/test/armyKeyedRecord";
import { FACTION_TAGLINES } from "./factionTaglines";

const ARMY_IDS = armyIndex.map(({ id }) => id);

describe("faction taglines", () => {
  it("has a tagline for every army", () => {
    expect(armyIdsMissingFrom(FACTION_TAGLINES, ARMY_IDS)).toEqual([]);
  });

  it("has no tagline for an army that does not exist", () => {
    expect(orphanArmyIds(FACTION_TAGLINES, ARMY_IDS)).toEqual([]);
  });
});
