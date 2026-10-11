import { useState } from 'react';
import { toggleMember } from '@/core/sets';
import type { PrintSectionDef } from './sections/printSections';

const allIdsOf = (sections: PrintSectionDef[]): Set<string> =>
  new Set(sections.map((section) => section.id));

/**
 * Which print sections are included. Starts with every section selected and
 * resets to that whenever `resetKey` (the loaded army) changes.
 */
export const useSectionSelection = (sections: PrintSectionDef[], resetKey: unknown) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => allIdsOf(sections));
  const [selectionKey, setSelectionKey] = useState(resetKey);

  // Adjusting state during render (React's recommended pattern) instead of in
  // an effect avoids an extra render pass.
  if (resetKey !== selectionKey) {
    setSelectionKey(resetKey);
    setSelectedIds(allIdsOf(sections));
  }

  const toggleSection = (id: string) => {
    setSelectedIds((previous) => toggleMember(previous, id));
  };

  return { selectedIds, toggleSection };
};
