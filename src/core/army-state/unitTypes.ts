/** Troop types: the units that count toward the break point and can be upgrades of other units. */
export const UNIT_TYPES = [
  "Artillery",
  "Cavalry",
  "Chariot",
  "Elephant",
  "Infantry",
  "Machine",
  "Monster",
];

const CHARACTER_TYPES = ["General", "Hero", "Wizard"];

/** A character is a General, Hero, or Wizard (the units that carry a Command value). */
export const isCharacter = (type: string): boolean =>
  CHARACTER_TYPES.includes(type);

/**
 * A unit can cast the army's spells if it's a Wizard or is data-flagged as a
 * `caster` (a General/Hero granted spellcasting by a special rule, e.g. the
 * Skaven Grey Seer).
 */
export const isCaster = (unit: { type: string; caster?: boolean }): boolean =>
  unit.type === "Wizard" || unit.caster === true;
