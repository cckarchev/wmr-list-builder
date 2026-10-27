export interface PrintOptions {
  /**
   * Show each spell's italic flavor line (off by default to save space/ink).
   */
  spellFluff: boolean;
  /**
   * Flow the text sections (everything but the stat table) into two columns.
   */
  twoColumn: boolean;
  /** Shrink the type across the sheet to fit more on the page. */
  smallFont: boolean;
  /** Omit the faction name / list name heading at the top of the sheet. */
  hideTitle: boolean;
  /** Tighten the spacing (margins/line-height) for a more compact layout. */
  condensed: boolean;
  /**
   * Start every section on a new page instead of separating them with a rule.
   */
  pagePerSection: boolean;
  /**
   * Set the sheet in a typeface with clearly distinct letters, easier to read
   * for dyslexic readers.
   */
  legibleFont: boolean;
}

export const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  spellFluff: false,
  twoColumn: false,
  smallFont: false,
  hideTitle: false,
  condensed: false,
  pagePerSection: false,
  legibleFont: false,
};
