interface Ordered {
  order?: number;
}

/** Sort by footnote number; a rule with no number sorts as zero. */
export const byRuleOrder = (a: Ordered, b: Ordered): number =>
  (a.order ?? 0) - (b.order ?? 0);
