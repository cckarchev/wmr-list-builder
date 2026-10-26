/**
 * localStorage access that never throws. Storage can be blocked (private mode,
 * site data disabled) or full, and the app then degrades to keeping
 * everything in memory: reads find nothing and writes do nothing.
 */

/** The stored string, or null when the key is missing or storage is blocked. */
export const readItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // storage blocked or full: keep it in memory only
  }
};

export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // storage blocked: nothing to remove
  }
};

/**
 * The parsed stored value, or undefined when it is missing, corrupt or blocked.
 */
export const readJson = (key: string): unknown => {
  const raw = readItem(key);

  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

export const writeJson = (key: string, value: unknown): void => {
  writeItem(key, JSON.stringify(value));
};
