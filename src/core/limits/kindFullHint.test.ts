import { describe, expect, it } from "vitest";
import type { UpgradeState } from "@/core/army-state/types";
import { taken, upgradeOfType } from "./fixtures";
import { kindFullHint } from "./kindFullHint";

const upgrades: Record<string, UpgradeState> = {
  crown: upgradeOfType("crown", "Device of Power"),
  sword: upgradeOfType("sword", "Magic Weapon"),
  wyvern: upgradeOfType("wyvern", "Monstrous Mount"),
  drummer: upgradeOfType("drummer", "Command"),
};

const ONE_STAND = 1;
const TWO_STANDS = 2;

describe("kindFullHint", () => {
  it("says the unit already carries as many of the kind as it has stands", () => {
    const carried = { crown: taken(1) };

    const hint = kindFullHint({
      carried,
      upgrades,
      upgradeId: "sword",
      stands: ONE_STAND,
    });

    expect(hint).toBe("Already carries 1 magic item");
  });

  it("counts this upgrade too, in the plural", () => {
    const carried = { crown: taken(1), sword: taken(1) };

    const hint = kindFullHint({
      carried,
      upgrades,
      upgradeId: "sword",
      stands: TWO_STANDS,
    });

    expect(hint).toBe("Already carries 2 magic items");
  });

  it("names the kind of the upgrade", () => {
    const carried = { wyvern: taken(1) };

    const hint = kindFullHint({
      carried,
      upgrades,
      upgradeId: "wyvern",
      stands: ONE_STAND,
    });

    expect(hint).toBe("Already carries 1 mount");
  });

  it("gives nothing while the unit still has room for the kind", () => {
    const carried = { crown: taken(1) };

    const hint = kindFullHint({
      carried,
      upgrades,
      upgradeId: "sword",
      stands: TWO_STANDS,
    });

    expect(hint).toBeUndefined();
  });

  it("gives nothing for an upgrade of no capped kind", () => {
    const carried = { drummer: taken(1) };

    const hint = kindFullHint({
      carried,
      upgrades,
      upgradeId: "drummer",
      stands: ONE_STAND,
    });

    expect(hint).toBeUndefined();
  });
});
