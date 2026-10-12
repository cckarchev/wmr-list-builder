import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { sheetTitle } from '@/core/print/sheetTitle';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePersistedList } from '@/hooks/usePersistedList';
import { useArmyStore } from '@/store/useArmyStore';
import styles from './Print.module.css';
import { PrintControls } from './print-controls/PrintControls';
import { PrintView } from './print-view/PrintView';
import { availablePrintSections } from './sections/printSections';
import { usePrintSectionCtx } from './usePrintSectionCtx';
import { useSectionSelection } from './useSectionSelection';
import { useStoredPrintOptions } from './useStoredPrintOptions';

/** Print never reads a share link: it always prints the list kept for this army. */
const NO_SHARE_CODE = null;

export const Print = () => {
  const { armyId } = useParams<{ armyId: string }>();
  const army = useArmyStore((s) => s.army);
  const label = useArmyStore((s) => s.label);
  const magic = useArmyStore((s) => s.magic);

  // Opening the sheet directly (a reload, a bookmark) restores the saved list.
  usePersistedList(armyId, NO_SHARE_CODE);

  const title = sheetTitle(army?.name ?? '', label);

  // Browsers propose the document title as the saved PDF's file name.
  useDocumentTitle(title);

  const { hasArmyRules, hasSpecialRules, hasMagicItems, hasSpells } = usePrintSectionCtx();

  const sections = useMemo(
    () => availablePrintSections({ hasArmyRules, hasSpecialRules, hasMagicItems, hasSpells }),
    [hasArmyRules, hasSpecialRules, hasMagicItems, hasSpells],
  );

  const { selectedIds, toggleSection } = useSectionSelection(sections, army);
  const { options, toggleOption } = useStoredPrintOptions();

  if (!army) {
    return null;
  }

  return (
    <main className={styles.page}>
      <PrintControls
        sections={sections}
        selectedIds={selectedIds}
        onToggleSection={toggleSection}
        options={options}
        onToggleOption={toggleOption}
        hasMagic={magic}
      />

      <PrintView title={title} sections={sections} selectedIds={selectedIds} options={options} />
    </main>
  );
};
