/** A usable count: NaN, infinities and negatives all become zero. */
export const toCount = (value: number): number => {
  const isCount = Number.isFinite(value) && value >= 0;

  return isCount ? value : 0;
};

/** Keep `value` within [min, max]; an undefined `max` leaves it unbounded above. */
export const clamp = (value: number, min: number, max: number | undefined): number => {
  if (value < min) {
    return min;
  }

  if (max !== undefined && value > max) {
    return max;
  }

  return value;
};
