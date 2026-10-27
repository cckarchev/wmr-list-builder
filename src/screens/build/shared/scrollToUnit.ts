import { unitDomId } from "./domIds";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Smooth scrolling animates, so it gives way to an instant jump under reduced
 * motion.
 */
const scrollBehavior = (): ScrollBehavior => {
  const prefersReducedMotion =
    window.matchMedia?.(REDUCED_MOTION_QUERY).matches ?? false;

  return prefersReducedMotion ? "auto" : "smooth";
};

/** Scroll a unit's roster card into the middle of the view. */
export const scrollToUnit = (unitId: string): void => {
  const card = document.getElementById(unitDomId(unitId));

  card?.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
};
