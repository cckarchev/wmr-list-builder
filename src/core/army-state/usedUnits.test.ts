import { beforeEach, describe, expect, it } from "vitest";
import { useArmyStore } from "@/store/useArmyStore";
import { defined } from "@/test/defined";
import { usedUnits } from "./usedUnits";

const get = () => useArmyStore.getState();

beforeEach(() => {
  get().reset();
});

describe("usedUnits", () => {
  it("returns only units with number > 0 and merges used upgrades", () => {
    get().setArmy("empire");
    get().setUnitUpgradeNumber("halberdiers", "battleBanner", 1);

    const used = usedUnits(get());
    // Only units with number > 0 are returned (Halberdiers auto-includes at its
    // min).
    expect(used.halberdiers).toBeDefined();
    expect(Object.values(used).every((u) => u.number > 0)).toBe(true);

    // used upgrade merges the global upgrade record with the unit entry
    const banner = defined(used.halberdiers.upgrades, "upgrades").battleBanner;

    expect(banner.number).toBe(1);
    expect(banner.type).toBe("Magic Standard"); // from the global record
  });
});
