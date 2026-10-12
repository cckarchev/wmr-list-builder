const STORAGE_KEY = 'wmr:printSectionOrder';

/** Remember the order of the print sections, so the next sheet prints them the same way. */
export const saveSectionOrder = (order: readonly string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
  } catch {
    // storage blocked (private mode / partitioned iframe): degrade to in-memory
  }
};

/** The saved section ids, or none. Ids the sheet no longer knows are left for the caller to drop. */
export const loadSectionOrder = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const stored: unknown = JSON.parse(raw);

    if (!Array.isArray(stored)) {
      return [];
    }

    return stored.filter((id): id is string => typeof id === 'string');
  } catch {
    return [];
  }
};
