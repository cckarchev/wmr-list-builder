import { describe, expect, it } from 'vitest';
import { pageBreaks } from './pageBreaks';

const PAGE = 1000;

describe('pageBreaks', () => {
  it('has no breaks for an empty sheet', () => {
    expect(pageBreaks([], PAGE)).toEqual([]);
  });

  it('has no breaks when everything fits on one page', () => {
    const blocks = [
      { top: 0, height: 400 },
      { top: 400, height: 600 },
    ];

    expect(pageBreaks(blocks, PAGE)).toEqual([]);
  });

  it('moves a block that would cross the page end to the next page', () => {
    const crossing = { top: 400, height: 700 };
    const blocks = [{ top: 0, height: 400 }, crossing];

    expect(pageBreaks(blocks, PAGE)).toEqual([crossing.top]);
  });

  it('measures each page from where the previous break fell', () => {
    const second = { top: 600, height: 600 };
    const third = { top: 1200, height: 500 };
    const blocks = [{ top: 0, height: 600 }, second, third];

    expect(pageBreaks(blocks, PAGE)).toEqual([second.top, third.top]);
  });

  it('carries a heading over with the block it introduces', () => {
    const heading = { top: 500, height: 30, keepWithNext: true };
    const blocks = [{ top: 0, height: 500 }, heading, { top: 530, height: 600 }];

    expect(pageBreaks(blocks, PAGE)).toEqual([heading.top]);
  });

  it('carries a run of headings over together', () => {
    const sectionHeading = { top: 500, height: 40, keepWithNext: true };
    const entryName = { top: 540, height: 20, keepWithNext: true };
    const blocks = [{ top: 0, height: 500 }, sectionHeading, entryName, { top: 560, height: 600 }];

    expect(pageBreaks(blocks, PAGE)).toEqual([sectionHeading.top]);
  });

  it('leaves a heading that already starts its page in place', () => {
    const body = { top: 30, height: 980 };
    const blocks = [{ top: 0, height: 30, keepWithNext: true }, body];

    expect(pageBreaks(blocks, PAGE)).toEqual([body.top]);
  });

  it('splits a block taller than a page at each page end', () => {
    const secondPage = PAGE;
    const thirdPage = PAGE + PAGE;

    expect(pageBreaks([{ top: 0, height: 2500 }], PAGE)).toEqual([secondPage, thirdPage]);
  });

  it('starts a tall block on a fresh page before splitting it', () => {
    const tall = { top: 500, height: 2500 };
    const blocks = [{ top: 0, height: 500 }, tall];
    const firstCut = tall.top + PAGE;
    const secondCut = firstCut + PAGE;

    expect(pageBreaks(blocks, PAGE)).toEqual([tall.top, firstCut, secondCut]);
  });

  it('reads blocks from top to bottom whatever order they come in', () => {
    const crossing = { top: 400, height: 700 };
    const blocks = [crossing, { top: 0, height: 400 }];

    expect(pageBreaks(blocks, PAGE)).toEqual([crossing.top]);
  });
});

describe('pageBreaks with forced breaks', () => {
  it('starts a new page where a block forces one, even with room left', () => {
    const forced = { top: 300, height: 0, breakBefore: true };
    const blocks = [{ top: 0, height: 300 }, forced, { top: 300, height: 200 }];

    expect(pageBreaks(blocks, PAGE)).toEqual([forced.top]);
  });

  it('measures the rest of the sheet from a forced break', () => {
    const forced = { top: 300, height: 0, breakBefore: true };
    const crossing = { top: 900, height: 500 };
    const blocks = [{ top: 0, height: 300 }, forced, { top: 300, height: 600 }, crossing];

    expect(pageBreaks(blocks, PAGE)).toEqual([forced.top, crossing.top]);
  });

  it('ignores a forced break that already starts its page', () => {
    const blocks = [
      { top: 0, height: 0, breakBefore: true },
      { top: 0, height: 300 },
    ];

    expect(pageBreaks(blocks, PAGE)).toEqual([]);
  });
});
