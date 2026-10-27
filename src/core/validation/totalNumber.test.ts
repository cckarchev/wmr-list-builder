import { describe, expect, it } from "vitest";
import { totalNumber } from "./totalNumber";

const SPEARMEN = 4;
const ARCHERS = 2;

const POOL = { spearmen: { number: SPEARMEN }, archers: { number: ARCHERS } };

describe("totalNumber", () => {
  it("adds up the number taken of each listed id", () => {
    expect(totalNumber(["spearmen", "archers"], POOL)).toBe(SPEARMEN + ARCHERS);
  });

  it("only counts the listed ids", () => {
    expect(totalNumber(["archers"], POOL)).toBe(ARCHERS);
  });

  it("is zero for no ids", () => {
    expect(totalNumber([], POOL)).toBe(0);
  });
});
