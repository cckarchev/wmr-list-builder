import { MISSING_STAT } from "@/core/lib/formatStat";
import type { StatValue } from "@/data/types";

/**
 * An upgrade's price label. Variable pricing that cannot be resolved for this
 * unit shows as "?pts".
 */
export const formatPrice = (
  price: StatValue | undefined,
  hasVariablePrice: boolean,
): string => {
  if (price !== undefined) {
    return `${price}pts`;
  }

  if (hasVariablePrice) {
    return "?pts";
  }

  // No price at all reads like any other missing stat.
  return MISSING_STAT;
};
