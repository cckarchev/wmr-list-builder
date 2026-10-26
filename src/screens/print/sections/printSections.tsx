import type { ReactNode } from "react";
import { ArmyRules } from "./army-rules/ArmyRules";
import { MagicItems } from "./MagicItems";
import { SpecialRules } from "./SpecialRules";
import { Spells } from "./spells/Spells";
import { Stats } from "./stats/Stats";
import { Validation } from "./validation/Validation";

/** What the current list has to print, so empty sections are never offered. */
export interface PrintSectionCtx {
  hasArmyRules: boolean;
  hasSpecialRules: boolean;
  hasMagicItems: boolean;
  hasSpells: boolean;
}

export interface PrintSectionDef {
  id: string;
  title: string;
  available: (ctx: PrintSectionCtx) => boolean;
  render: () => ReactNode;
  /** Left out of the sheet until the reader ticks it. */
  startsOff?: boolean;
  /** Too wide to split, so it never flows into two columns. */
  singleColumn?: boolean;
}

const PRINT_SECTIONS: PrintSectionDef[] = [
  {
    id: "stats",
    title: "Stats",
    available: () => true,
    render: () => <Stats />,
    singleColumn: true,
  },
  {
    id: "armyRules",
    title: "Army Rules",
    available: (ctx) => ctx.hasArmyRules,
    render: () => <ArmyRules />,
  },
  {
    id: "specialRules",
    title: "Special Rules",
    available: (ctx) => ctx.hasSpecialRules,
    render: () => <SpecialRules />,
  },
  {
    id: "magicItems",
    title: "Magic Items",
    available: (ctx) => ctx.hasMagicItems,
    render: () => <MagicItems />,
  },
  {
    id: "spells",
    title: "Spells",
    available: (ctx) => ctx.hasSpells,
    render: () => <Spells />,
  },
  {
    id: "validation",
    title: "Validation",
    available: () => true,
    render: () => <Validation />,
    startsOff: true,
  },
];

export const availablePrintSections = (
  ctx: PrintSectionCtx,
): PrintSectionDef[] =>
  PRINT_SECTIONS.filter((section) => section.available(ctx));

/** Every section's id in the default print order, whatever the list has. */
export const PRINT_SECTION_IDS = PRINT_SECTIONS.map((section) => section.id);

/**
 * The ids of the sections a fresh sheet includes: all but those that start off.
 */
export const defaultSelectedIds = (
  sections: PrintSectionDef[],
): Set<string> => {
  const includedIds = sections
    .filter((section) => !section.startsOff)
    .map((section) => section.id);

  return new Set(includedIds);
};
