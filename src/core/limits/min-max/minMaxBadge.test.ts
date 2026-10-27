import { describe, expect, it } from "vitest";
import { DEFAULT_GAME_SIZE } from "@/store/armyData";
import { SMALLEST_GAME } from "@/test/gameSizes";
import { minMaxBadge } from "./minMaxBadge";

describe("minMaxBadge", () => {
  it("returns undefined when there are no constraints", () => {
    expect(minMaxBadge({}, DEFAULT_GAME_SIZE)).toBeUndefined();
  });

  describe("numeric per-1,000-points constraints (resolved to the game size)", () => {
    it("shows a range for min + max", () => {
      expect(minMaxBadge({ min: 1, max: 6 }, DEFAULT_GAME_SIZE)).toBe("2-12");
    });

    it("shows max for a max-only constraint", () => {
      expect(minMaxBadge({ max: 2 }, DEFAULT_GAME_SIZE)).toBe("max 4");
    });

    it("shows min for a min-only constraint", () => {
      expect(minMaxBadge({ min: 2 }, DEFAULT_GAME_SIZE)).toBe("min 4");
    });

    it("scales against the game size", () => {
      expect(minMaxBadge({ min: 1, max: 6 }, SMALLEST_GAME)).toBe("1-6");
    });
  });

  describe("absolute per-army constraints", () => {
    it("shows an exact count for equal armyMin/armyMax", () => {
      expect(minMaxBadge({ armyMin: 1, armyMax: 1 }, DEFAULT_GAME_SIZE)).toBe(
        "exactly 1",
      );
    });

    it("shows a range for differing armyMin/armyMax", () => {
      expect(minMaxBadge({ armyMin: 1, armyMax: 2 }, DEFAULT_GAME_SIZE)).toBe(
        "1-2",
      );
    });

    it("shows max for an armyMax-only constraint", () => {
      expect(minMaxBadge({ armyMax: 2 }, DEFAULT_GAME_SIZE)).toBe("max 2");
    });
  });

  describe("keyword tokens", () => {
    it('resolves "elite" to max (size − 1)', () => {
      expect(minMaxBadge({ max: "elite" }, DEFAULT_GAME_SIZE)).toBe("max 1");
    });

    it('shows a terse form for "Half or None"', () => {
      expect(minMaxBadge({ min: "Half or None" }, DEFAULT_GAME_SIZE)).toBe(
        "half or none",
      );
    });

    it('shows "max half" for "Up to Half"', () => {
      expect(minMaxBadge({ max: "Up to Half" }, DEFAULT_GAME_SIZE)).toBe(
        "max half",
      );
    });

    it('shows "= <unit>" for an "As <unit>" token', () => {
      expect(minMaxBadge({ min: "As Goblins" }, DEFAULT_GAME_SIZE)).toBe(
        "= Goblins",
      );
    });
  });
});
