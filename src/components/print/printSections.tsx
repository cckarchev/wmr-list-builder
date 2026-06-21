import type { ReactNode } from 'react';
import Stats from './Stats';
import ArmyRules from './ArmyRules';
import SpecialRules from './SpecialRules';
import MagicItems from './MagicItems';
import Spells from './Spells';

export interface PrintSectionCtx {
  hasArmyRules: boolean;
  hasSpecialRules: boolean;
  magic: boolean;
}

export interface PrintSectionDef {
  id: string;
  title: string;
  available: (ctx: PrintSectionCtx) => boolean;
  render: () => ReactNode;
}

export const PRINT_SECTIONS: PrintSectionDef[] = [
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
    available: (ctx) => ctx.magic,
    render: () => <MagicItems />,
  },
  { id: 'spells', title: 'Spells', available: (ctx) => ctx.magic, render: () => <Spells /> },
];

export function availablePrintSections(ctx: PrintSectionCtx): PrintSectionDef[] {
  return PRINT_SECTIONS.filter((section) => section.available(ctx));
}
