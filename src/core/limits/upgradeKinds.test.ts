import { describe, expect, it } from "vitest";
import type { UpgradeState } from "@/core/army-state/types";
import { taken, upgradeOfType } from "./fixtures";
import {
  countOfKind,
  MAGIC_ITEM_KIND,
  MOUNT_KIND,
  sameKindTakenAlongside,
} from "./upgradeKinds";

const upgrades: Record<string, UpgradeState> = {
  banner: upgradeOfType("banner", "Magic Standard"),
  sword: upgradeOfType("sword", "Magic Weapon"),
  crown: upgradeOfType("crown", "Device of Power"),
  wyvern: upgradeOfType("wyvern", "Monstrous Mount"),
  drummer: upgradeOfType("drummer", "Command"),
};

describe("countOfKind", () => {
  it("sums the carried counts of every upgrade of the kind", () => {
    const carried = { banner: taken(1), sword: taken(2), wyvern: taken(1) };
    const magicItemsCarried = 3;

    expect(countOfKind(carried, upgrades, MAGIC_ITEM_KIND)).toBe(
      magicItemsCarried,
    );
    expect(countOfKind(carried, upgrades, MOUNT_KIND)).toBe(1);
  });

  it("counts nothing for a unit with no upgrades", () => {
    expect(countOfKind(undefined, upgrades, MAGIC_ITEM_KIND)).toBe(0);
  });
});

describe("sameKindTakenAlongside", () => {
  it("counts the other magic items the unit carries, whatever their type", () => {
    const carried = { banner: taken(1), sword: taken(1), crown: taken(1) };

    expect(
      sameKindTakenAlongside({ carried, upgrades, upgradeId: "sword" }),
    ).toBe(2);
  });

  it("leaves out upgrades of other kinds", () => {
    const carried = { wyvern: taken(1), drummer: taken(1) };

    expect(
      sameKindTakenAlongside({ carried, upgrades, upgradeId: "sword" }),
    ).toBe(0);
  });

  it("counts nothing for an upgrade that belongs to no capped kind", () => {
    const carried = { banner: taken(1) };

    expect(
      sameKindTakenAlongside({ carried, upgrades, upgradeId: "drummer" }),
    ).toBe(0);
  });
});
