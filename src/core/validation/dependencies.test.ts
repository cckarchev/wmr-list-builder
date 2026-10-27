import { beforeEach, describe, expect, it } from "vitest";
import type { UnitState } from "@/core/army-state/types";
import { DEFAULT_GAME_SIZE } from "@/store/armyData";
import { defined } from "@/test/defined";
import { SMALLEST_GAME } from "@/test/gameSizes";
import { get, messages, unit, upgrade, validateNamed } from "./fixtures";
import { toSentence } from "./toSentence";
import { validate } from "./validation";

beforeEach(() => {
  get().reset();
});

describe("homologousUnits (real data: chaos-dwarfs Earthshaker Cannon <-> Death Rocket)", () => {
  it("sums homologous counts and builds the id sentence", () => {
    get().setArmy("chaos-dwarfs");
    get().setGameSize(SMALLEST_GAME);
    get().setUnitNumber("earthshakerCannon", 1);
    get().setUnitNumber("deathRocket", 1); // combined 2 > max 1
    expect(messages()).toContain(
      "Maximum of 1 Earthshaker Cannon or Death Rocket per 1,000 points.",
    );
  });
});

describe("requiredUnits (real data: albion Fenbeast requires Druid)", () => {
  it("flags a Fenbeast taken without a Druid", () => {
    get().setArmy("albion");
    get().setUnitNumber("fenbeast", 1);

    expect(messages()).toContain("Fenbeast must be taken with Druid.");

    get().setUnitNumber("druid", 1);

    expect(messages()).not.toContain("Fenbeast must be taken with Druid.");
  });
});

describe("augendUnits (real data: empire Detachment augends Halberdiers/Handgunners/...)", () => {
  it("flags more augend units than the units they attach to", () => {
    get().setArmy("empire");
    // Find the unit carrying augendUnits in the loaded data.
    const augendUnitId = defined(
      Object.keys(get().units).find(
        (id) => (get().units[id] as UnitState).augendUnits,
      ),
    );
    const augends = defined(
      (get().units[augendUnitId] as UnitState).augendUnits,
    );
    const nameOf = (id: string): string => (get().units[id] as UnitState).name;

    // The store auto-includes the base units at their minimums, so test the
    // augend logic directly with the base units empty.
    const units: Record<string, UnitState> = {
      [augendUnitId]: unit({
        name: nameOf(augendUnitId),
        number: 1,
        augendUnits: augends,
      }),
    };

    for (const a of augends) {
      units[a] = unit({ name: nameOf(a), number: 0 });
    }

    const errors = validate(units, {}, DEFAULT_GAME_SIZE).map((e) => e.message);
    const augendNames = toSentence(augends.map(nameOf));

    expect(errors).toContain(
      `1 ${nameOf(augendUnitId)} requires at least 1 ${augendNames}.`,
    );
  });
});

// ---------------------------------------------------------------------------
// Upgrade-side constraints: homologousUpgrades / requiredUpgrades /
// prohibitedUnits / prohibitedUpgrades are ABSENT from every Revolution army
// JSON (verified by grep), so the branches that read them are reachable only
// via synthetic state. They also exercise the upgrades loop in `validate`,
// which no real-data test reaches (every Revolution constraint lives on a
// unit).
// ---------------------------------------------------------------------------
describe("homologousUpgrades (synthetic - not present in Revolution data)", () => {
  it("sums homologous upgrade counts and builds the id sentence", () => {
    const upgrades = {
      a: upgrade({ number: 1, homologousUpgrades: ["b"], armyMax: 1 }),
      b: upgrade({ number: 1 }),
    };

    expect(
      validateNamed({}, upgrades, SMALLEST_GAME).map((e) => e.message),
    ).toContain("Maximum of 1 A or B per army.");
  });
});

describe("requiredUpgrades (synthetic - not present in Revolution data)", () => {
  it("feeds the keyword-min requiredCount via upgrades", () => {
    const upgrades = {
      a: upgrade({ min: "As B", number: 1, requiredUpgrades: ["b"] }),
      b: upgrade({ number: 3 }),
    };

    expect(
      validateNamed({}, upgrades, SMALLEST_GAME).map((e) => e.message),
    ).toContain("Minimum of 3 A per 3 B.");
  });

  it('flags an upgrade taken without its requiredUpgrades ("must be taken with")', () => {
    const upgrades = {
      a: upgrade({ number: 1, requiredUpgrades: ["b"] }),
      b: upgrade({ number: 0 }),
    };
    const msgs = validateNamed({}, upgrades, SMALLEST_GAME).map(
      (e) => e.message,
    );

    expect(msgs).toContain("A must be taken with B.");

    upgrades.b.number = 1;

    expect(
      validateNamed({}, upgrades, SMALLEST_GAME).map((e) => e.message),
    ).not.toContain("A must be taken with B.");
  });
});

describe("prohibited constraints (synthetic - not present in Revolution data)", () => {
  it('flags prohibitedUnits ("cannot be taken with")', () => {
    const units = {
      a: unit({ number: 1, prohibitedUnits: ["b"] }),
      b: unit({ number: 1 }),
    };
    const msgs = validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message);

    expect(msgs).toContain("A cannot be taken with B.");

    units.b.number = 0;

    expect(
      validateNamed(units, {}, SMALLEST_GAME).map((e) => e.message),
    ).not.toContain("A cannot be taken with B.");
  });

  it('flags prohibitedUpgrades ("cannot be taken with")', () => {
    const upgrades = {
      a: upgrade({ number: 1, prohibitedUpgrades: ["b"] }),
      b: upgrade({ number: 1 }),
    };

    expect(
      validateNamed({}, upgrades, SMALLEST_GAME).map((e) => e.message),
    ).toContain("A cannot be taken with B.");
  });
});
