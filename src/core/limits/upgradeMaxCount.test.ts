import { describe, expect, it } from "vitest";
import { armyAllowanceLeft, upgradeMaxCount } from "./upgradeMaxCount";

const STANDS = 3;
const NONE = 0;

describe("upgradeMaxCount within the unit stands", () => {
  it("caps an upgrade without an army limit at the unit stands", () => {
    const max = upgradeMaxCount({
      stands: STANDS,
      taken: NONE,
      armyTotal: NONE,
    });

    expect(max).toBe(STANDS);
  });

  it("never exceeds the unit stands even with a generous army limit", () => {
    const armyMax = 10;

    const max = upgradeMaxCount({
      stands: STANDS,
      taken: NONE,
      armyTotal: NONE,
      armyMax,
    });

    expect(max).toBe(STANDS);
  });

  it("leaves only the stands not already taken by other upgrades of its kind", () => {
    const sameKindTaken = 2;

    const max = upgradeMaxCount({
      stands: STANDS,
      taken: NONE,
      armyTotal: NONE,
      sameKindTaken,
    });

    expect(max).toBe(STANDS - sameKindTaken);
  });

  it("allows none once other upgrades of its kind fill every stand", () => {
    const max = upgradeMaxCount({
      stands: STANDS,
      taken: NONE,
      armyTotal: NONE,
      sameKindTaken: STANDS,
    });

    expect(max).toBe(NONE);
  });
});

describe("upgradeMaxCount against the army limit", () => {
  it("allows what the army limit leaves after other units", () => {
    const armyMax = 2;
    const usedElsewhere = 1;

    const max = upgradeMaxCount({
      stands: STANDS,
      taken: NONE,
      armyTotal: usedElsewhere,
      armyMax,
    });

    expect(max).toBe(armyMax - usedElsewhere);
  });

  it("counts this unit's own share as still available to it", () => {
    const armyMax = 1;
    const taken = 1;

    const max = upgradeMaxCount({
      stands: STANDS,
      taken,
      armyTotal: taken,
      armyMax,
    });

    expect(max).toBe(armyMax);
  });

  it("allows none once other units have spent more than the limit", () => {
    const armyMax = 1;
    const overspent = 2;

    const max = upgradeMaxCount({
      stands: STANDS,
      taken: NONE,
      armyTotal: overspent,
      armyMax,
    });

    expect(max).toBe(NONE);
  });

  it("applies the tighter of the kind slots and the army limit", () => {
    const armyMax = 1;
    const sameKindTaken = STANDS;

    const max = upgradeMaxCount({
      stands: STANDS,
      taken: NONE,
      armyTotal: NONE,
      armyMax,
      sameKindTaken,
    });

    expect(max).toBe(NONE);
  });
});

describe("armyAllowanceLeft", () => {
  it("is undefined for an upgrade with no army limit", () => {
    expect(armyAllowanceLeft({ taken: NONE, armyTotal: NONE })).toBeUndefined();
  });

  it("leaves what other units have not spent, this unit's share included", () => {
    const armyMax = 2;
    const taken = 1;
    const armyTotal = 2;

    expect(armyAllowanceLeft({ taken, armyTotal, armyMax })).toBe(1);
  });

  it("never goes below none once other units overspend", () => {
    const armyMax = 1;
    const overspent = 2;

    expect(
      armyAllowanceLeft({ taken: NONE, armyTotal: overspent, armyMax }),
    ).toBe(NONE);
  });
});
