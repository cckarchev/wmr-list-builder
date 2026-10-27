import { beforeEach, describe, expect, it } from "vitest";
import { pointsCost } from "@/core/army-state/armyTotals";
import {
  usedUnits as getUsedUnits,
  type UsedUnit,
} from "@/core/army-state/usedUnits";
import { useArmyStore } from "@/store/useArmyStore";
import { defined } from "@/test/defined";
import { buildTextList } from "./textList";

beforeEach(() => {
  useArmyStore.getState().reset();
});

/** The text list for whatever the store currently holds. */
const textListFromStore = (): string => {
  const state = useArmyStore.getState();

  return buildTextList({
    armyName: defined(state.army, "army").name,
    label: state.label,
    points: pointsCost(state),
    usedUnits: getUsedUnits(state),
    version: state.version,
  });
};

describe("buildTextList", () => {
  it("produces the correct plain-text roster for a goblin army with two unit types", () => {
    const store = useArmyStore.getState();
    store.setArmy("goblin");
    store.setUnitNumber("goblins", 2); // 2 × 30 = 60 pts
    store.setUnitNumber("wolfRiders", 1); // 1 × 60 = 60 pts

    // Goblin force-includes its minimums: 8 Goblins, 4 Wolf Riders, and the
    // Goblin Warboss (armyMin 1). Requested counts below those floors clamp up.
    // The Warboss is a character, so the totals line counts 12 units, breaking
    // at 6.
    const expected =
      "Goblin, 560 points\n" +
      "Warmaster Revolution\n" +
      "--------------------------------\n" +
      "240 - 8 Goblins\n" +
      "240 - 4 Wolf Riders\n" +
      " 80 - 1 Goblin Warboss\n" +
      "--------------------------------\n" +
      "560 - 12/6";

    expect(textListFromStore()).toBe(expected);
  });

  it("includes the label when set", () => {
    const store = useArmyStore.getState();
    store.setArmy("goblin");
    store.setUnitNumber("goblins", 1);
    store.setLabel("My Test List");

    expect(textListFromStore().startsWith("My Test List\n")).toBe(true);
  });

  it("includes upgrade lines when upgrades are used", () => {
    const store = useArmyStore.getState();
    store.setArmy("goblin");
    store.setUnitNumber("goblins", 2);
    store.setUnitUpgradeNumber("goblins", "squigHerd", 1); // +0 pts

    expect(textListFromStore()).toContain("Squig Herd");
  });

  it("omits the label line when label is empty", () => {
    const store = useArmyStore.getState();
    store.setArmy("goblin");
    store.setUnitNumber("goblins", 1);

    expect(textListFromStore().startsWith("Goblin,")).toBe(true);
  });
});

const WOLF_RIDERS_POINTS = 60;
const WOLF_RIDERS_CODE = 3;

describe("buildTextList names", () => {
  it("lists units and upgrades by display name, not id", () => {
    const usedUnits: Record<string, UsedUnit> = {
      wolfRiders: {
        id: "wolfRiders",
        name: "Wolf Riders",
        code: WOLF_RIDERS_CODE,
        type: "Cavalry",
        points: WOLF_RIDERS_POINTS,
        number: 1,
        pointsCost: WOLF_RIDERS_POINTS,
        upgrades: {
          battleBanner: {
            id: "battleBanner",
            name: "Battle Banner",
            type: "Magic Standard",
            number: 1,
            pointsCost: 0,
          },
        },
      },
    };

    const result = buildTextList({
      armyName: "Goblin",
      label: "",
      points: WOLF_RIDERS_POINTS,
      usedUnits,
      version: "",
    });

    expect(result).toContain("1 Wolf Riders");
    expect(result).toContain("1 Battle Banner (0)");
    expect(result).not.toContain("wolfRiders");
  });
});

const HERD_POINTS = 10;
const HERD_CODE = 1;
const WOLF_RIDERS_TAKEN = 3;
const HERDS_TAKEN = 2;
const TOTAL_POINTS =
  WOLF_RIDERS_POINTS * WOLF_RIDERS_TAKEN + HERD_POINTS * HERDS_TAKEN;

describe("buildTextList totals", () => {
  it("counts only the units that count toward the break point", () => {
    const usedUnits: Record<string, UsedUnit> = {
      wolfRiders: {
        id: "wolfRiders",
        name: "Wolf Riders",
        code: WOLF_RIDERS_CODE,
        type: "Cavalry",
        points: WOLF_RIDERS_POINTS,
        number: WOLF_RIDERS_TAKEN,
        pointsCost: WOLF_RIDERS_POINTS * WOLF_RIDERS_TAKEN,
      },
      herd: {
        id: "herd",
        name: "Herd",
        code: HERD_CODE,
        type: "Infantry",
        points: HERD_POINTS,
        number: HERDS_TAKEN,
        pointsCost: HERD_POINTS * HERDS_TAKEN,
        noCount: true,
      },
    };

    const result = buildTextList({
      armyName: "Goblin",
      label: "",
      points: TOTAL_POINTS,
      usedUnits,
      version: "",
    });

    // Only the 3 Wolf Riders count: the noCount Herd is left out, so the army
    // breaks at 2.
    expect(result.endsWith(`${TOTAL_POINTS} - 3/2`)).toBe(true);
  });
});
