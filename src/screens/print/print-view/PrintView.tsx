import type { PrintOptions } from '@/core/print/printOptions';
import { PrintOptionsContext } from '../printOptions';
import type { PrintSectionDef } from '../sections/printSections';
import styles from './PrintView.module.css';

interface PrintViewProps {
  /** The sheet heading, also used as the document title. */
  title: string;
  sections: PrintSectionDef[];
  selectedIds: ReadonlySet<string>;
  options: PrintOptions;
}

export const PrintView = ({ title, sections, selectedIds, options }: PrintViewProps) => {
  const visibleSections = sections.filter((section) => selectedIds.has(section.id));

  // The stats table is too wide to split, so it never flows into two columns.
  const usesColumns = (section: PrintSectionDef) => options.twoColumn && section.id !== 'stats';

  return (
    <PrintOptionsContext.Provider value={options}>
      <article
        className={styles.document}
        aria-label="Print sheet"
        data-small-font={options.smallFont || undefined}
        data-condensed={options.condensed || undefined}
      >
        {title && !options.hideTitle && <h1 className={styles.title}>{title}</h1>}
        {visibleSections.map((section) => (
          <section
            className={styles.section}
            key={section.id}
            data-columns={usesColumns(section) || undefined}
          >
            {section.render()}
          </section>
        ))}
      </article>
    </PrintOptionsContext.Provider>
  );
};
