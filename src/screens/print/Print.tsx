import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useArmyStore } from '@/store/useArmyStore';
import styles from './Print.module.css';
import { PrintControls } from './print-controls/PrintControls';
import { PrintView } from './print-view/PrintView';
import { DEFAULT_PRINT_OPTIONS, type PrintOptions } from './printOptions';
import { availablePrintSections } from './sections/printSections';
import { useSectionSelection } from './useSectionSelection';

export const Print = () => {
  const { armyId } = useParams<{ armyId: string }>();
  const army = useArmyStore((s) => s.army);
  const armyIdInStore = useArmyStore((s) => s.armyId);
  const setArmy = useArmyStore((s) => s.setArmy);
  const hasArmyRules = useArmyStore((s) => !!s.army?.armyRules);
  const hasSpecialRules = useArmyStore((s) => !!s.specialRules);
  const magic = useArmyStore((s) => s.magic);

  // Load the army when it is missing or a different one is in the store.
  useEffect(() => {
    if (armyId && armyIdInStore !== armyId) {
      setArmy(armyId);
    }
  }, [armyId, armyIdInStore, setArmy]);

  const sections = useMemo(
    () => availablePrintSections({ hasArmyRules, hasSpecialRules, magic }),
    [hasArmyRules, hasSpecialRules, magic],
  );

  const { selectedIds, toggleSection } = useSectionSelection(sections, army);
  const [options, setOptions] = useState<PrintOptions>(DEFAULT_PRINT_OPTIONS);

  const toggleOption = (key: keyof PrintOptions) => {
    setOptions((previous) => ({ ...previous, [key]: !previous[key] }));
  };

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

      <PrintView sections={sections} selectedIds={selectedIds} options={options} />
    </main>
  );
};
