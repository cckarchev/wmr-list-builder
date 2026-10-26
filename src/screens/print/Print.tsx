import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { sheetTitle } from "@/core/print/sheetTitle";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { usePersistedList } from "@/hooks/usePersistedList";
import { useArmyStore } from "@/store/useArmyStore";
import { usePageBreaks } from "./hooks/usePageBreaks";
import { usePrintSectionCtx } from "./hooks/usePrintSectionCtx";
import { useSectionOrder } from "./hooks/useSectionOrder";
import { useSectionSelection } from "./hooks/useSectionSelection";
import { useStoredPrintOptions } from "./hooks/useStoredPrintOptions";
import styles from "./Print.module.css";
import { PrintControls } from "./print-controls/PrintControls";
import { PrintView } from "./print-view/PrintView";
import { availablePrintSections } from "./sections/printSections";

/**
 * Print never reads a share link: it always prints the list kept for this army.
 */
const NO_SHARE_CODE = null;

export const Print = () => {
  const { armyId } = useParams<{ armyId: string }>();
  const army = useArmyStore((s) => s.army);
  const label = useArmyStore((s) => s.label);
  const magic = useArmyStore((s) => s.magic);

  // Opening the sheet directly (a reload, a bookmark) restores the saved list.
  usePersistedList(armyId, NO_SHARE_CODE);

  const title = sheetTitle(army?.name ?? "", label);

  // Browsers propose the document title as the saved PDF's file name.
  useDocumentTitle(title);

  const { hasArmyRules, hasSpecialRules, hasMagicItems, hasSpells } =
    usePrintSectionCtx();

  const sections = useMemo(
    () =>
      availablePrintSections({
        hasArmyRules,
        hasSpecialRules,
        hasMagicItems,
        hasSpells,
      }),
    [hasArmyRules, hasSpecialRules, hasMagicItems, hasSpells],
  );

  const { selectedIds, toggleSection } = useSectionSelection(sections, army);
  const { orderedSections, moveSection } = useSectionOrder(sections);
  const { options, toggleOption } = useStoredPrintOptions();
  const { ref: sheetRef, breaks } = usePageBreaks<HTMLElement>();

  // Two columns balance over a whole section on screen but fill a page at a
  // time on paper, so the sheet's layout says nothing about the pages.
  const shownBreaks = options.twoColumn ? null : breaks;
  const pageCount = shownBreaks ? shownBreaks.length + 1 : null;

  if (!army) {
    return null;
  }

  return (
    <main className={styles.page}>
      <PrintControls
        sections={orderedSections}
        selectedIds={selectedIds}
        onToggleSection={toggleSection}
        onMoveSection={moveSection}
        options={options}
        onToggleOption={toggleOption}
        hasMagic={magic}
        pageCount={pageCount}
      />

      <PrintView
        title={title}
        sections={orderedSections}
        selectedIds={selectedIds}
        options={options}
        sheetRef={sheetRef}
        breaks={shownBreaks}
      />
    </main>
  );
};
