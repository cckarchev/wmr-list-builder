import type { Spell } from "@/data/types";

/** A spell's markdown paragraphs, optionally led by its flavor line in italics. */
export const spellBlocks = (spell: Spell, withFluff: boolean): string[] => {
  if (!withFluff) {
    return spell.text;
  }

  const fluffLine = `*${spell.fluff}*`;

  return [fluffLine, ...spell.text];
};
