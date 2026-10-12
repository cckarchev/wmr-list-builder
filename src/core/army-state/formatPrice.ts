import type { StatValue } from '@/data/types';

/** Shown when an upgrade has no price at all. */
const NO_PRICE = '–';

/** An upgrade's price label. Variable pricing that cannot be resolved for this unit shows as "?pts". */
export const formatPrice = (price: StatValue | undefined, hasVariablePrice: boolean): string => {
  if (price !== undefined) {
    return `${price}pts`;
  }

  if (hasVariablePrice) {
    return '?pts';
  }

  return NO_PRICE;
};
