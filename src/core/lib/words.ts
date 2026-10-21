const WHITESPACE = /\s+/;

/** The words in `text`, split on any whitespace, with no empty ones. */
export const words = (text: string): string[] =>
  text.trim().split(WHITESPACE).filter(Boolean);
