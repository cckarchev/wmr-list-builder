/** A usable count: NaN, infinities and negatives all become zero. */
export const toCount = (value: number): number => {
  const isCount = Number.isFinite(value) && value >= 0;

  return isCount ? value : 0;
};

/** Keep `value` within [min, max]; an undefined `max` leaves it unbounded above. */
export const clamp = (
  value: number,
  min: number,
  max: number | undefined,
): number => {
  if (value < min) {
    return min;
  }

  if (max !== undefined && value > max) {
    return max;
  }

  return value;
};

/** Divisor for halving a count. */
const HALVES = 2;

export const halfDown = (count: number): number => Math.floor(count / HALVES);

export const halfUp = (count: number): number => Math.ceil(count / HALVES);
