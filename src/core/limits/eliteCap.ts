/** Army-size steps that grant no `elite` troop: the first 1,000 points. */
const FREE_ELITE_STEPS = 1;

/** `elite`: at most one per army-size step after the first, never negative. */
export const eliteCap = (size: number): number =>
  Math.max(0, size - FREE_ELITE_STEPS);
