const CSS_PX_PER_INCH = 96;
const MM_PER_INCH = 25.4;

const mmToPx = (mm: number): number => (mm * CSS_PX_PER_INCH) / MM_PER_INCH;

// The sheet prints on ISO A4. Keep the margin in step with --print-page-margin
// in tokens.css and the @page rule in global.css.
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_MARGIN_MM = 12;
const MARGINS_PER_PAGE = 2;
const PRINTABLE_HEIGHT_MM = A4_HEIGHT_MM - PAGE_MARGIN_MM * MARGINS_PER_PAGE;

/** Browsers may round a box's width down by up to a pixel. */
const ROUNDING_TOLERANCE_PX = 1;

export const A4_WIDTH_PX = mmToPx(A4_WIDTH_MM);

/** An A4 page less its top and bottom margins. */
export const A4_PRINTABLE_HEIGHT_PX = mmToPx(PRINTABLE_HEIGHT_MM);

/**
 * Whether an on-screen sheet `width` pixels wide is as wide as A4, so its text
 * wraps as it will on paper. A narrower sheet wraps more and runs longer.
 */
export const isPaperWide = (width: number): boolean =>
  width >= A4_WIDTH_PX - ROUNDING_TOLERANCE_PX;
