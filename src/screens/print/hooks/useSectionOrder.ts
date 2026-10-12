import { useMemo } from 'react';
import { loadSectionOrder, saveSectionOrder } from '@/core/persistence/sectionOrder';
import { completeOrder, moveInOrder, type OrderStep, orderById } from '@/core/print/sectionOrder';
import { useStoredState } from '@/hooks/useStoredState';
import { PRINT_SECTION_IDS, type PrintSectionDef } from '../sections/printSections';

const loadOrder = (): string[] => completeOrder(loadSectionOrder(), PRINT_SECTION_IDS);

/**
 * The print sections in the order the reader chose, starting from the last one
 * used and saved on every change. The order covers every section, so a section
 * this list lacks keeps its place for the next list that has it.
 */
export const useSectionOrder = (sections: PrintSectionDef[]) => {
  const [order, setOrder] = useStoredState(loadOrder, saveSectionOrder);

  const orderedSections = useMemo(() => orderById(sections, order), [sections, order]);

  const moveSection = (id: string, step: OrderStep) => {
    const movable = new Set(sections.map((section) => section.id));

    setOrder((previous) => moveInOrder(previous, id, step, movable));
  };

  return { orderedSections, moveSection };
};
