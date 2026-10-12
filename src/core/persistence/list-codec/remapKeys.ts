/**
 * Copy a record under new keys. Each key goes through `lookup`; entries whose
 * key does not resolve are dropped.
 */
export const remapKeys = <V>(
  record: Record<string, V>,
  lookup: (key: string) => string | number | undefined,
): Record<string, V> => {
  const remapped: Record<string, V> = {};

  for (const [key, value] of Object.entries(record)) {
    const newKey = lookup(key);

    if (newKey !== undefined) {
      remapped[newKey] = value;
    }
  }

  return remapped;
};
