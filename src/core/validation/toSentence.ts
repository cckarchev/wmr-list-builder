const CONNECTOR = ', ';
const LAST_CONNECTOR = ' or ';

/** Joins names as prose: "A, B or C". */
export const toSentence = (items: string[]): string => {
  if (items.length > 1) {
    const leading = items.slice(0, -1);
    const last = items[items.length - 1];

    return leading.join(CONNECTOR) + LAST_CONNECTOR + last;
  }

  return items[0];
};
