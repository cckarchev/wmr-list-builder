import { describe, expect, it } from "vitest";
import { matchesQuery } from "./textSearch";

describe("matchesQuery", () => {
  it("matches everything when the query is blank", () => {
    expect(matchesQuery("Dark Elves", "")).toBe(true);
    expect(matchesQuery("Dark Elves", "   ")).toBe(true);
  });

  it("matches a substring regardless of case", () => {
    expect(matchesQuery("Dark Elves", "ELV")).toBe(true);
    expect(matchesQuery("Dark Elves", "dwarf")).toBe(false);
  });

  it("ignores accents on either side", () => {
    expect(matchesQuery("Nippón", "nippon")).toBe(true);
    expect(matchesQuery("Nippon", "nippón")).toBe(true);
  });

  it("requires every word of the query, in any order", () => {
    expect(matchesQuery("Vampire Counts", "counts vamp")).toBe(true);
    expect(matchesQuery("Vampire Counts", "vampire kings")).toBe(false);
  });
});
