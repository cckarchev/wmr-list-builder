/** A piece of the sheet the printer will not split, measured from the sheet's top. */
export interface SheetBlock {
  top: number;
  height: number;
  /** A heading that must stay on the same page as the block after it. */
  keepWithNext?: boolean;
}

/**
 * Where a page that has to break before `blocks[index]` really starts: any
 * headings right above it move to the new page with it, as long as they do not
 * already start the current page.
 */
const breakBefore = (blocks: SheetBlock[], index: number, pageStart: number): number => {
  let start = blocks[index].top;

  for (let previous = index - 1; previous >= 0; previous--) {
    const heading = blocks[previous];

    if (!heading.keepWithNext || heading.top <= pageStart) {
      break;
    }

    start = heading.top;
  }

  return start;
};

/**
 * The offsets at which pages 2, 3, ... begin, laying the blocks onto pages of
 * `pageHeight` the way the browser does when printing: a block that would cross
 * the page end moves to the next page, taking its heading along, and a block
 * taller than a whole page is cut at each page end.
 */
export const pageBreaks = (blocks: SheetBlock[], pageHeight: number): number[] => {
  const ordered = [...blocks].sort((a, b) => a.top - b.top);
  const breaks: number[] = [];
  let pageStart = 0;

  ordered.forEach((block, index) => {
    const bottom = block.top + block.height;

    if (bottom - pageStart <= pageHeight) {
      return;
    }

    if (block.top > pageStart) {
      pageStart = breakBefore(ordered, index, pageStart);
      breaks.push(pageStart);
    }

    while (bottom - pageStart > pageHeight) {
      pageStart += pageHeight;
      breaks.push(pageStart);
    }
  });

  return breaks;
};
