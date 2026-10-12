/** Combining marks left behind by NFD, e.g. the accent split off "ó". */
const COMBINING_MARKS = /\p{M}/gu;

const WHITESPACE = /\s+/;

/** Lowercase and strip accents so "Nippón" and "nippon" compare equal. */
const fold = (text: string): string => {
  const decomposed = text.normalize('NFD');
  const unaccented = decomposed.replace(COMBINING_MARKS, '');

  return unaccented.toLowerCase();
};

/**
 * Whether `text` matches a free-text search: every word of `query` must appear
 * somewhere in it, ignoring case and accents. A blank query matches anything.
 */
export const matchesQuery = (text: string, query: string): boolean => {
  const terms = fold(query).trim().split(WHITESPACE).filter(Boolean);

  if (terms.length === 0) {
    return true;
  }

  const folded = fold(text);

  return terms.every((term) => folded.includes(term));
};
