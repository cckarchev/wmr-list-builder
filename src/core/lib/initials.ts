import { words } from './words';

const MAX_INITIALS = 2;

/** A word that starts with a capital, so joining words like "of" are skipped. */
const isCapitalized = (word: string): boolean => {
  const first = word.charAt(0);

  return first !== first.toLowerCase();
};

/** Up to two capital initials for a name, e.g. "Dogs of War" -> "DW". */
export const initials = (name: string): string => {
  const capitalized = words(name).filter(isCapitalized);
  const letters = capitalized.map((word) => word.charAt(0));

  return letters.slice(0, MAX_INITIALS).join('');
};
