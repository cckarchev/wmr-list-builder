import { useState } from 'react';
import { toggleMember } from '@/core/lib/sets';
import { defaultSelectedIds, type PrintSectionDef } from '../sections/printSections';

/**
 * Which print sections are included. Starts with every section selected but
 * those that start off, and resets to that whenever `resetKey` (the loaded army) changes.
 */
export const useSectionSelection = (sections: PrintSectionDef[], resetKey: unknown) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => defaultSelectedIds(sections));
  const [selectionKey, setSelectionKey] = useState(resetKey);

  // Adjusting state during render (React's recommended pattern) instead of in
  // an effect avoids an extra render pass.
  if (resetKey !== selectionKey) {
    setSelectionKey(resetKey);
    setSelectedIds(defaultSelectedIds(sections));
  }

  const toggleSection = (id: string) => {
    setSelectedIds((previous) => toggleMember(previous, id));
  };

  return { selectedIds, toggleSection };
};
