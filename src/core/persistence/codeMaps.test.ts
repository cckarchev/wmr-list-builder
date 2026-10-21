import { describe, expect, it } from "vitest";
import { loadArmy } from "@/data/loadArmy";
import { MAGIC_ITEM_CODE_MIN } from "@/data/magicItems";
import { buildCodeMaps, codeMapsFor } from "./codeMaps";

describe("buildCodeMaps", () => {
  it("maps unit ids to codes and back", () => {
    const army = loadArmy("empire");
    const maps = buildCodeMaps(army);
    const [id, unit] = Object.entries(army.units)[0];

    expect(maps.unitCodeById.get(id)).toBe(unit.code);
    expect(maps.unitIdByCode.get(unit.code)).toBe(id);
  });

  it("includes army upgrades and magic items in the upgrade maps", () => {
    const maps = buildCodeMaps(loadArmy("empire"));

    for (const [id, code] of maps.upgradeCodeById) {
      expect(maps.upgradeIdByCode.get(code)).toBe(id);
    }

    const codes = [...maps.upgradeIdByCode.keys()];

    expect(codes.some((code) => code >= MAGIC_ITEM_CODE_MIN)).toBe(true);
  });
});

describe("codeMapsFor", () => {
  it("builds the code maps of the army with that id", () => {
    expect(codeMapsFor("empire")).toEqual(buildCodeMaps(loadArmy("empire")));
  });

  it("throws for an unknown army id", () => {
    expect(() => codeMapsFor("no-such-army")).toThrow();
  });
});
