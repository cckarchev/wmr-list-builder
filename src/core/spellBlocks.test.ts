import { describe, expect, it } from "vitest";
import type { Spell } from "@/data/types";
import { spellBlocks } from "./spellBlocks";

const spell: Spell = {
  name: "Fireball",
  roll: 5,
  fluff: "A ball of flame.",
  text: ["Shoot at a unit.", "Ignore cover."],
};

describe("spellBlocks", () => {
  it("leads with the fluff line in italics when asked for", () => {
    expect(spellBlocks(spell, true)).toEqual([
      "*A ball of flame.*",
      ...spell.text,
    ]);
  });

  it("leaves the fluff out otherwise", () => {
    expect(spellBlocks(spell, false)).toEqual(spell.text);
  });
});
