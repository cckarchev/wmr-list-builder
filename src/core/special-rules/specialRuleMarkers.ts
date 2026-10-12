/** Special rules keyed by id; `order` is the rule's footnote number. */
export type NumberedRules = Record<string, { order?: number }>;

const byNumber = (a: number, b: number) => a - b;

/**
 * Footnote markers ("*1, *3") for every name that has a numbered special rule,
 * sorted by number. Empty when none of the names is numbered.
 */
export const specialRuleMarkers = (names: string[], rules: NumberedRules): string => {
  const orders = names
    .map((name) => rules[name]?.order)
    .filter((order): order is number => order !== undefined);

  return orders
    .sort(byNumber)
    .map((order) => `*${order}`)
    .join(', ');
};
