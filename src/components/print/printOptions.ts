import { createContext, useContext } from 'react';

export interface PrintOptions {
  /** Show each spell's italic flavor line (off by default to save space/ink). */
  spellFluff: boolean;
  /** Flow the text sections (everything but the stat table) into two columns. */
  twoColumn: boolean;
  /** Shrink the type across the sheet to fit more on the page. */
  smallFont: boolean;
  /** Omit the faction name / list name heading at the top of the sheet. */
  hideTitle: boolean;
  /** Tighten the spacing (margins/line-height) for a more compact layout. */
  condensed: boolean;
}

const DEFAULTS: PrintOptions = {
  spellFluff: false,
  twoColumn: false,
  smallFont: false,
  hideTitle: false,
  condensed: false,
};

export const PrintOptionsContext = createContext<PrintOptions>(DEFAULTS);

export function usePrintOptions(): PrintOptions {
  return useContext(PrintOptionsContext);
}
