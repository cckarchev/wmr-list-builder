import { describe, expect, it } from "vitest";
import { A4_PRINTABLE_HEIGHT_PX, A4_WIDTH_PX, isPaperWide } from "./paper";

/** 210mm at 96 CSS pixels per inch. */
const EXPECTED_A4_WIDTH_PX = 793.7;

/** 297mm less two 12mm margins, at 96 CSS pixels per inch. */
const EXPECTED_PRINTABLE_HEIGHT_PX = 1031.8;

const PRECISION = 1;

/** An iPad in portrait, where the sheet shrinks to the viewport. */
const TABLET_PORTRAIT_WIDTH = 768;

describe("A4 sizes in CSS pixels", () => {
  it("converts the A4 width and printable height", () => {
    expect(A4_WIDTH_PX).toBeCloseTo(EXPECTED_A4_WIDTH_PX, PRECISION);
    expect(A4_PRINTABLE_HEIGHT_PX).toBeCloseTo(
      EXPECTED_PRINTABLE_HEIGHT_PX,
      PRECISION,
    );
  });
});

describe("isPaperWide", () => {
  it("is true for a sheet as wide as A4", () => {
    expect(isPaperWide(A4_WIDTH_PX)).toBe(true);
  });

  it("allows for the browser rounding the width down a fraction of a pixel", () => {
    expect(isPaperWide(Math.floor(A4_WIDTH_PX))).toBe(true);
  });

  it("is false for a sheet squeezed narrower than A4", () => {
    expect(isPaperWide(TABLET_PORTRAIT_WIDTH)).toBe(false);
  });
});
