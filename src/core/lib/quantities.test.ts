import { describe, expect, it } from "vitest";
import { countOf, formatPoints } from "./quantities";

const NONE = 0;
const ONE = 1;
const SEVERAL = 3;

const GAME_SIZE = 2000;
const LARGE_GAME_SIZE = 12500;
const SMALL_COST = 750;

describe("countOf", () => {
  it("keeps the noun singular for one", () => {
    expect(countOf(ONE, "issue")).toBe("1 issue");
  });

  it("makes the noun plural for any other count", () => {
    expect(countOf(NONE, "page")).toBe("0 pages");
    expect(countOf(SEVERAL, "unit")).toBe("3 units");
  });
});

describe("formatPoints", () => {
  it("groups thousands with a comma", () => {
    expect(formatPoints(GAME_SIZE)).toBe("2,000");
    expect(formatPoints(LARGE_GAME_SIZE)).toBe("12,500");
  });

  it("leaves small values as they are", () => {
    expect(formatPoints(SMALL_COST)).toBe("750");
  });
});
