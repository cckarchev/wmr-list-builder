import { Icon } from '@/components/Icon';
import { classNames } from '@/core/lib/classNames';
import type { PrintOptions } from '../printOptions';
import type { PrintSectionDef } from '../sections/printSections';
import { CheckOption } from './check-option/CheckOption';
import { OptionGroup } from './option-group/OptionGroup';
import styles from './PrintControls.module.css';

const PRINT_ICON_SIZE = 18;

interface OptionToggle {
  key: keyof PrintOptions;
  label: string;
  /** Only offered when the army has spells. */
  needsMagic?: boolean;
}

const OPTION_TOGGLES: OptionToggle[] = [
  { key: 'twoColumn', label: 'Two columns' },
  { key: 'condensed', label: 'Condensed' },
  { key: 'smallFont', label: 'Smaller font' },
  { key: 'spellFluff', label: 'Spell fluff', needsMagic: true },
  { key: 'hideTitle', label: 'Hide name' },
];

interface PrintControlsProps {
  sections: PrintSectionDef[];
  selectedIds: ReadonlySet<string>;
  onToggleSection: (id: string) => void;
  options: PrintOptions;
  onToggleOption: (key: keyof PrintOptions) => void;
  hasMagic: boolean;
}

const printPage = () => {
  window.print();
};

/** Sticky bar with the section and option checkboxes and the Print button. */
export const PrintControls = ({
  sections,
  selectedIds,
  onToggleSection,
  options,
  onToggleOption,
  hasMagic,
}: PrintControlsProps) => {
  const toggles = OPTION_TOGGLES.filter((toggle) => hasMagic || !toggle.needsMagic);

  return (
    <div className={classNames(styles.controls, 'no-print')}>
      <div className={styles.stack}>
        <OptionGroup label="Sections">
          {sections.map((section) => (
            <CheckOption
              key={section.id}
              label={section.title}
              checked={selectedIds.has(section.id)}
              onToggle={() => onToggleSection(section.id)}
            />
          ))}
        </OptionGroup>

        <OptionGroup label="Options">
          {toggles.map((toggle) => (
            <CheckOption
              key={toggle.key}
              label={toggle.label}
              checked={options[toggle.key]}
              onToggle={() => onToggleOption(toggle.key)}
            />
          ))}
        </OptionGroup>
      </div>

      <button className={styles.printButton} type="button" onClick={printPage}>
        <Icon name="print" size={PRINT_ICON_SIZE} />
        Print
      </button>
    </div>
  );
};
