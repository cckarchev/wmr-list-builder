import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { classNames } from '@/core/classNames';
import { useArmyStore } from '@/store/useArmyStore';
import { CheckOption } from './check-option/CheckOption';
import { OptionGroup } from './option-group/OptionGroup';
import styles from './Print.module.css';
import { PrintView } from './print-view/PrintView';
import { availablePrintSections } from './sections/printSections';

/** Builds a handler that flips a boolean option. */
const flip = (setOption: Dispatch<SetStateAction<boolean>>) => () => {
  setOption((value) => !value);
};

const printPage = () => {
  window.print();
};

export const Print = () => {
  const { armyId } = useParams<{ armyId: string }>();
  const army = useArmyStore((s) => s.army);
  const armyIdInStore = useArmyStore((s) => s.armyId);
  const setArmy = useArmyStore((s) => s.setArmy);
  const hasArmyRules = useArmyStore((s) => !!s.army?.armyRules);
  const hasSpecialRules = useArmyStore((s) => !!s.specialRules);
  const magic = useArmyStore((s) => s.magic);

  // Load army if not already loaded or if different army
  useEffect(() => {
    if (armyId && armyIdInStore !== armyId) {
      setArmy(armyId);
    }
  }, [armyId, armyIdInStore, setArmy]);

  const sections = useMemo(
    () => availablePrintSections({ hasArmyRules, hasSpecialRules, magic }),
    [hasArmyRules, hasSpecialRules, magic],
  );

  // Local selection state: start with all available sections selected.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id)),
  );

  // When the loaded army changes, reset the selection to all sections.
  // Adjusting state during render (React's recommended pattern) instead of an
  // effect avoids an extra render pass.
  const [selectionArmy, setSelectionArmy] = useState(army);

  if (army !== selectionArmy) {
    setSelectionArmy(army);
    setSelectedIds(new Set(sections.map((s) => s.id)));
  }

  // Print options (distinct from which sections to include). Both default off.
  const [spellFluff, setSpellFluff] = useState(false);
  const [twoColumn, setTwoColumn] = useState(false);
  const [smallFont, setSmallFont] = useState(false);
  const [hideTitle, setHideTitle] = useState(false);
  const [condensed, setCondensed] = useState(false);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  if (!army) {
    return null;
  }

  return (
    <main className={styles.page}>
      <div className={classNames(styles.controls, 'no-print')}>
        <div className={styles.stack}>
          <OptionGroup label="Sections">
            {sections.map((section) => (
              <CheckOption
                key={section.id}
                label={section.title}
                checked={selectedIds.has(section.id)}
                onToggle={() => toggle(section.id)}
              />
            ))}
          </OptionGroup>

          <OptionGroup label="Options">
            <CheckOption label="Two columns" checked={twoColumn} onToggle={flip(setTwoColumn)} />
            <CheckOption label="Condensed" checked={condensed} onToggle={flip(setCondensed)} />
            <CheckOption label="Smaller font" checked={smallFont} onToggle={flip(setSmallFont)} />
            {magic && (
              <CheckOption
                label="Spell fluff"
                checked={spellFluff}
                onToggle={flip(setSpellFluff)}
              />
            )}
            <CheckOption label="Hide name" checked={hideTitle} onToggle={flip(setHideTitle)} />
          </OptionGroup>
        </div>

        <button className={styles.printButton} type="button" onClick={printPage}>
          <Icon name="print" size={18} />
          Print
        </button>
      </div>

      <PrintView
        sections={sections}
        selectedIds={selectedIds}
        options={{ spellFluff, twoColumn, smallFont, hideTitle, condensed }}
      />
    </main>
  );
};
