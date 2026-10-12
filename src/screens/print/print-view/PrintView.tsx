import type { Ref } from 'react';
import { classNames } from '@/core/lib/classNames';
import type { PrintOptions } from '@/core/print/printOptions';
import { PrintOptionsContext } from '../printOptions';
import type { PrintSectionDef } from '../sections/printSections';
import styles from './PrintView.module.css';

/** The first break starts page 2. */
const FIRST_BROKEN_PAGE = 2;

interface PrintViewProps {
  /** The sheet heading, also used as the document title. */
  title: string;
  sections: PrintSectionDef[];
  selectedIds: ReadonlySet<string>;
  options: PrintOptions;
  /** Attached to the sheet, so its page breaks can be measured. */
  sheetRef?: Ref<HTMLElement>;
  /** Predicted page starts, in pixels from the top of the sheet's content. */
  breaks?: number[] | null;
}

interface PageBreakProps {
  offset: number;
  page: number;
}

/** A predicted page cut. Only drawn on the paper-sized preview, where the
    sheet's padding is the page margin the offset is measured from. */
const PageBreak = ({ offset, page }: PageBreakProps) => (
  <div
    className={classNames(styles.pageBreak, 'no-print')}
    style={{ top: `calc(var(--print-page-margin) + ${offset}px)` }}
    aria-hidden="true"
  >
    <span className={styles.pageBreakLabel}>Page {page}</span>
  </div>
);

export const PrintView = ({
  title,
  sections,
  selectedIds,
  options,
  sheetRef,
  breaks,
}: PrintViewProps) => {
  const visibleSections = sections.filter((section) => selectedIds.has(section.id));

  const usesColumns = (section: PrintSectionDef) => options.twoColumn && !section.singleColumn;

  // On screen the columns balance over the whole section, while the printer
  // fills them a page at a time, so a cut drawn across them would be wrong.
  const drawsBreaks = !options.twoColumn;
  const shownBreaks = drawsBreaks ? (breaks ?? []) : [];

  return (
    <PrintOptionsContext.Provider value={options}>
      <article
        className={styles.document}
        ref={sheetRef}
        aria-label="Print sheet"
        data-small-font={options.smallFont || undefined}
        data-condensed={options.condensed || undefined}
        data-page-per-section={options.pagePerSection || undefined}
        data-legible-font={options.legibleFont || undefined}
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

        {shownBreaks.map((offset, index) => (
          <PageBreak key={offset} offset={offset} page={index + FIRST_BROKEN_PAGE} />
        ))}
      </article>
    </PrintOptionsContext.Provider>
  );
};
