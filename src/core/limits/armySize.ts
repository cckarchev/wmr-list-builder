/** Points in one army-size step; per-1,000-point limits scale with each step. */
export const POINTS_PER_ARMY_SIZE = 1000;

/** The smallest army size, which even a list under 1,000 points gets. */
const MIN_ARMY_SIZE = 1;

/** Port of getters.js `size`: whole 1,000-point steps, at least one. */
export const armySize = (points: number): number =>
  Math.max(MIN_ARMY_SIZE, Math.floor(points / POINTS_PER_ARMY_SIZE));
