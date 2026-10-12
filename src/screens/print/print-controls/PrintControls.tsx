import { Button } from '@/components/button/Button';
import { Icon } from '@/components/Icon';
import { Tooltip } from '@/components/tooltip/Tooltip';
import { classNames } from '@/core/lib/classNames';
import { countOf } from '@/core/lib/quantities';
import type { PrintOptions } from '@/core/print/printOptions';
import type { OrderStep } from '@/core/print/sectionOrder';
import type { PrintSectionDef } from '../sections/printSections';
import { CheckOption } from './check-option/CheckOption';
import { OptionGroup } from './option-group/OptionGroup';
import styles from './PrintControls.module.css';
import { SectionOrder } from './section-order/SectionOrder';

const PRINT_ICON_SIZE = 18;

/** Ordering needs at least two sections to swap. */
const MIN_ORDERABLE_SECTIONS = 2;

const PAGE_COUNT_HINT =
  'Estimated for A4 at 100% scale. Saving to PDF may break pages differently.';

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
  { key: 'legibleFont', label: 'Legible font' },
  { key: 'pagePerSection', label: 'Page per section' },
  { key: 'spellFluff', label: 'Spell fluff', needsMagic: true },
  { key: 'hideTitle', label: 'Hide list name' },
];

interface PrintControlsProps {
  /** The sections in their print order. */
  sections: PrintSectionDef[];
  selectedIds: ReadonlySet<string>;
  onToggleSection: (id: string) => void;
  onMoveSection: (id: string, step: OrderStep) => void;
  options: PrintOptions;
  onToggleOption: (key: keyof PrintOptions) => void;
  hasMagic: boolean;
  /** Estimated printed pages, or null when the preview cannot tell. */
  pageCount: number | null;
}

const pageCountLabel = (pageCount: number): string => `≈ ${countOf(pageCount, 'page')}`;

const printPage = () => {
  window.print();
};

/** Sticky bar with the section and option checkboxes and the Print button. */
export const PrintControls = ({
  sections,
  selectedIds,
  onToggleSection,
  onMoveSection,
  options,
  onToggleOption,
  hasMagic,
  pageCount,
}: PrintControlsProps) => {
  const toggles = OPTION_TOGGLES.filter((toggle) => hasMagic || !toggle.needsMagic);
  const orderable = sections.length >= MIN_ORDERABLE_SECTIONS;

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

          {orderable && <SectionOrder sections={sections} onMove={onMoveSection} />}
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

      <div className={styles.printColumn}>
        <Button className={styles.printButton} onClick={printPage}>
          <Icon name="print" size={PRINT_ICON_SIZE} />
          Print
        </Button>

        {pageCount !== null && (
          <Tooltip label={PAGE_COUNT_HINT}>
            <span className={styles.pageCount}>{pageCountLabel(pageCount)}</span>
          </Tooltip>
        )}
      </div>
    </div>
  );
};
