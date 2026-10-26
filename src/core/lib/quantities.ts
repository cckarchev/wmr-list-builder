const SINGULAR = 1;

/** Points are written the English way, with a comma between thousands. */
const POINTS_LOCALE = "en-US";

/**
 * A count with its noun, plural unless the count is one: "1 issue", "3 issues".
 */
export const countOf = (count: number, noun: string): string => {
  const suffix = count === SINGULAR ? "" : "s";

  return `${count} ${noun}${suffix}`;
};

/** A points value with its thousands grouped, e.g. "2,000". */
export const formatPoints = (points: number): string =>
  points.toLocaleString(POINTS_LOCALE);
