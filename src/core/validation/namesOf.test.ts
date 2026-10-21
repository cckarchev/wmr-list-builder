import { describe, expect, it } from "vitest";
import { namesOf } from "./namesOf";

const pool = {
  goblins: { name: "Goblins" },
  wolfRiders: { name: "Wolf Riders" },
};

describe("namesOf", () => {
  it("maps ids to their display names, in order", () => {
    expect(namesOf(["wolfRiders", "goblins"], pool)).toEqual([
      "Wolf Riders",
      "Goblins",
    ]);
  });

  it("returns no names for no ids", () => {
    expect(namesOf([], pool)).toEqual([]);
  });
});
