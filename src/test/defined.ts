/**
 * Narrows away null and undefined, failing loudly when the value is missing.
 * Tests use it instead of a non-null assertion so a missing value fails with a
 * readable message rather than a TypeError further down.
 */
export const defined = <T>(value: T | null | undefined, label = "value"): T => {
  if (value === null || value === undefined) {
    throw new Error(`Expected ${label} to be defined`);
  }

  return value;
};
