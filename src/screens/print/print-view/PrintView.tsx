import { classNames } from '@/core/classNames';
import { useArmyStore } from '@/store/useArmyStore';
import { type PrintOptions, PrintOptionsContext } from '../printOptions';
import type { PrintSectionDef } from '../sections/printSections';
import styles from './PrintView.module.css';

interface PrintViewProps {
  sections: PrintSectionDef[];
  selectedIds: Set<string>;
  options: PrintOptions;
}

export const PrintView = ({ sections, selectedIds, options }: PrintViewProps) => {
  const armyName = useArmyStore((s) => s.army?.name ?? '');
  const label = useArmyStore((s) => s.label);
  const title = label ? `${armyName} · ${label}` : armyName;

  // The global print stylesheet keys off these plain class names.
  const classes = classNames(
    styles.document,
    'print-document',
    options.smallFont && 'font-small',
    options.condensed && 'condensed',
  );
  const visibleSections = sections.filter((section) => selectedIds.has(section.id));

  // The stats table is too wide to split, so it never flows into two columns.
  const usesColumns = (section: PrintSectionDef) => options.twoColumn && section.id !== 'stats';

  return (
    <PrintOptionsContext.Provider value={options}>
      <div className={classes}>
        {armyName && !options.hideTitle && <h1 className={styles.title}>{title}</h1>}
        {visibleSections.map((section) => (
          <section
            className={styles.section}
            key={section.id}
            data-columns={usesColumns(section) || undefined}
          >
            {section.render()}
          </section>
        ))}
      </div>
    </PrintOptionsContext.Provider>
  );
};
