import { type RefCallback, useEffect, useState } from 'react';
import { pageBreaks, type SheetBlock } from '@/core/print/pageBreaks';

const CSS_PX_PER_INCH = 96;
const MM_PER_INCH = 25.4;

// An A4 page less the top and bottom margins. Keep the margin in step with
// --print-page-margin in tokens.css and the @page rule in global.css.
const A4_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 12;
const MARGINS_PER_PAGE = 2;
const PRINTABLE_HEIGHT_MM = A4_HEIGHT_MM - PAGE_MARGIN_MM * MARGINS_PER_PAGE;
const PRINTABLE_HEIGHT_PX = (PRINTABLE_HEIGHT_MM * CSS_PX_PER_INCH) / MM_PER_INCH;

/**
 * The preview is only as wide as the printed page from the tablet up (the
 * --tablet-up custom media). Narrower, the text wraps differently from paper,
 * so its heights say nothing about where the pages break.
 */
const PAPER_SIZED_QUERY = '(min-width: 768px)';

/** The pieces the printer keeps whole, and the headings it keeps with their body. */
const BLOCK_SELECTOR = 'h1, h3, dt, dd, p, li, tr';
const KEEP_WITH_NEXT_SELECTOR = 'h1, h3, dt';
const FORCED_BREAK = 'page';

/**
 * The sheet's children that must start a new page, such as each section with
 * "Page per section", as empty blocks at their top edge. Their CSS break only
 * applies in print, but its computed value is there to read on screen too.
 */
const forcedBreaks = (sheet: HTMLElement, contentTop: number): SheetBlock[] => {
  const children = Array.from(sheet.children);
  const forced = children.filter((child) => getComputedStyle(child).breakBefore === FORCED_BREAK);

  return forced.map((child) => ({
    top: child.getBoundingClientRect().top - contentTop,
    height: 0,
    breakBefore: true,
  }));
};

/** Each innermost block on the sheet, measured from the top of its content box. */
const measureBlocks = (sheet: HTMLElement): SheetBlock[] => {
  const sheetTop = sheet.getBoundingClientRect().top;
  const paddingTop = Number.parseFloat(getComputedStyle(sheet).paddingTop) || 0;
  const contentTop = sheetTop + paddingTop;

  const elements = Array.from(sheet.querySelectorAll<HTMLElement>(BLOCK_SELECTOR));
  const innermost = elements.filter((element) => !element.querySelector(BLOCK_SELECTOR));

  const blocks = innermost.map((element) => {
    const box = element.getBoundingClientRect();

    return {
      top: box.top - contentTop,
      height: box.height,
      keepWithNext: element.matches(KEEP_WITH_NEXT_SELECTOR),
    };
  });

  return [...blocks, ...forcedBreaks(sheet, contentTop)];
};

const sameBreaks = (a: number[] | null, b: number[] | null): boolean => {
  if (a === null || b === null) {
    return a === b;
  }

  return a.length === b.length && a.every((offset, index) => offset === b[index]);
};

interface PageBreaks<T extends HTMLElement> {
  /** Attach to the print sheet. */
  ref: RefCallback<T>;
  /**
   * Where pages 2, 3, ... begin, in pixels from the top of the sheet's content,
   * or null when the preview is too narrow to predict them.
   */
  breaks: number[] | null;
}

/**
 * An estimate of where the printed A4 pages will break, from the on-screen
 * sheet's own layout. Re-measured whenever the sheet changes size, such as when
 * a section or option is toggled.
 */
export const usePageBreaks = <T extends HTMLElement>(): PageBreaks<T> => {
  const [sheet, setSheet] = useState<T | null>(null);
  const [breaks, setBreaks] = useState<number[] | null>(null);

  useEffect(() => {
    if (!sheet || !window.matchMedia) {
      return;
    }

    const paperSized = window.matchMedia(PAPER_SIZED_QUERY);

    const update = () => {
      const next = paperSized.matches
        ? pageBreaks(measureBlocks(sheet), PRINTABLE_HEIGHT_PX)
        : null;

      setBreaks((current) => (sameBreaks(current, next) ? current : next));
    };

    const observer = new ResizeObserver(update);

    update();
    observer.observe(sheet);
    paperSized.addEventListener('change', update);

    return () => {
      observer.disconnect();
      paperSized.removeEventListener('change', update);
    };
  }, [sheet]);

  return { ref: setSheet, breaks };
};
