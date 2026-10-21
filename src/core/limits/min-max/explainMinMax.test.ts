import { describe, expect, it } from "vitest";
import { DEFAULT_GAME_SIZE } from "@/store/armyData";
import { SMALLEST_GAME } from "@/test/gameSizes";
import { explainMinMax } from "./explainMinMax";

describe("explainMinMax", () => {
  it("returns undefined when there are no min/max constraints", () => {
    expect(explainMinMax({}, DEFAULT_GAME_SIZE)).toBeUndefined();
  });

  describe("numeric per-1,000-points constraints", () => {
    it("explains a min + max, scaled to the current game size", () => {
      // Slingers: min 1 / max 6 per 1,000 pts. At 2,000 pts → 2-12.
      expect(explainMinMax({ min: 1, max: 6 }, DEFAULT_GAME_SIZE)).toBe(
        "min 1 / max 6 per 1,000 pts (≈ 2-12 at this size)",
      );
    });

    it("explains a max-only constraint", () => {
      // Ogres: max 2 per 1,000 pts. At 2,000 pts → up to 4.
      expect(explainMinMax({ max: 2 }, DEFAULT_GAME_SIZE)).toBe(
        "max 2 per 1,000 pts (≈ up to 4 at this size)",
      );
    });

    it("explains a min-only constraint", () => {
      // Warriors: min 2 per 1,000 pts. At 2,000 pts → 4+.
      expect(explainMinMax({ min: 2 }, DEFAULT_GAME_SIZE)).toBe(
        "min 2 per 1,000 pts (≈ 4+ at this size)",
      );
    });

    it("scales against the game size (1,000 pts → ×1)", () => {
      expect(explainMinMax({ min: 1, max: 6 }, SMALLEST_GAME)).toBe(
        "min 1 / max 6 per 1,000 pts (≈ 1-6 at this size)",
      );
    });
  });

  describe("absolute per-army constraints", () => {
    it("explains an armyMin + armyMax pair", () => {
      expect(explainMinMax({ armyMin: 1, armyMax: 2 }, DEFAULT_GAME_SIZE)).toBe(
        "min 1 / max 2 per army",
      );
    });

    it('collapses equal armyMin/armyMax to "exactly N"', () => {
      expect(explainMinMax({ armyMin: 1, armyMax: 1 }, DEFAULT_GAME_SIZE)).toBe(
        "exactly 1 per army",
      );
    });

    it("explains an armyMax-only constraint", () => {
      expect(explainMinMax({ armyMax: 2 }, DEFAULT_GAME_SIZE)).toBe(
        "max 2 per army",
      );
    });

    it("takes precedence over numeric min/max", () => {
      expect(
        explainMinMax({ armyMin: 1, min: 4, max: 8 }, DEFAULT_GAME_SIZE),
      ).toBe("min 1 per army");
    });
  });
});

describe("explainMinMax with keyword tokens", () => {
  it('explains "elite" as size − 1', () => {
    // size = floor(2000 / 1000) = 2, so max = 1.
    expect(explainMinMax({ max: "elite" }, DEFAULT_GAME_SIZE)).toBe(
      "max 1 (elite: 1 per 1,000 pts after the first)",
    );
  });

  it('explains "Half or None"', () => {
    expect(explainMinMax({ min: "Half or None" }, DEFAULT_GAME_SIZE)).toBe(
      "half or none of its unit",
    );
  });

  it('explains "All or None"', () => {
    expect(explainMinMax({ min: "All or None" }, DEFAULT_GAME_SIZE)).toBe(
      "all or none of its unit",
    );
  });

  it('explains "Up to Half" living in the max field', () => {
    expect(explainMinMax({ max: "Up to Half" }, DEFAULT_GAME_SIZE)).toBe(
      "up to half of its unit",
    );
  });

  it('explains an "As <unit>" token', () => {
    expect(explainMinMax({ min: "As Goblins" }, DEFAULT_GAME_SIZE)).toBe(
      "same number as Goblins",
    );
  });
});
