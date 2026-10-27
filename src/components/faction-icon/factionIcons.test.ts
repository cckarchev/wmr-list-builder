import { describe, expect, it } from "vitest";
import { armyIndex } from "@/data/armyIndex";
import { armyIdsMissingFrom, orphanArmyIds } from "@/test/armyKeyedRecord";
import {
  FACTION_ICON_PATHS,
  hasFactionIcon,
  MIRRORED_FACTION_ICONS,
} from "./factionIcons";

const ARMY_IDS = armyIndex.map(({ id }) => id);

describe("faction icons", () => {
  it("has an icon for every army", () => {
    expect(armyIdsMissingFrom(FACTION_ICON_PATHS, ARMY_IDS)).toEqual([]);
  });

  it("has no icon for an army that does not exist", () => {
    expect(orphanArmyIds(FACTION_ICON_PATHS, ARMY_IDS)).toEqual([]);
  });

  it("only mirrors armies that have an icon", () => {
    const unknown = [...MIRRORED_FACTION_ICONS].filter(
      (id) => !Object.hasOwn(FACTION_ICON_PATHS, id),
    );

    expect(unknown).toEqual([]);
  });

  it("knows which armies have an icon", () => {
    expect(hasFactionIcon("goblin")).toBe(true);
    expect(hasFactionIcon("not-an-army")).toBe(false);
    expect(hasFactionIcon("constructor")).toBe(false);
  });
});
