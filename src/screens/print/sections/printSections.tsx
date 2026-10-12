import type { ReactNode } from 'react';
import { ArmyRules } from './army-rules/ArmyRules';
import { MagicItems } from './MagicItems';
import { SpecialRules } from './SpecialRules';
import { Spells } from './spells/Spells';
import { Stats } from './stats/Stats';

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
}

const PRINT_SECTIONS: PrintSectionDef[] = [
  { id: 'stats', title: 'Stats', available: () => true, render: () => <Stats /> },
  {
    id: 'armyRules',
    title: 'Army Rules',
    available: (ctx) => ctx.hasArmyRules,
    render: () => <ArmyRules />,
  },
  {
    id: 'specialRules',
    title: 'Special Rules',
    available: (ctx) => ctx.hasSpecialRules,
    render: () => <SpecialRules />,
  },
  {
    id: 'magicItems',
    title: 'Magic Items',
    available: (ctx) => ctx.hasMagicItems,
    render: () => <MagicItems />,
  },
  { id: 'spells', title: 'Spells', available: (ctx) => ctx.hasSpells, render: () => <Spells /> },
];

export const availablePrintSections = (ctx: PrintSectionCtx): PrintSectionDef[] =>
  PRINT_SECTIONS.filter((section) => section.available(ctx));

/** Every section's id in the default print order, whatever the list has. */
export const PRINT_SECTION_IDS = PRINT_SECTIONS.map((section) => section.id);
