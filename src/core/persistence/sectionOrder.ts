import { readJson, writeJson } from "./storage";

const STORAGE_KEY = "wmr:printSectionOrder";

/** Remember the order of the print sections, so the next sheet prints them the same way. */
export const saveSectionOrder = (order: readonly string[]): void => {
  writeJson(STORAGE_KEY, order);
};

/** The saved section ids, or none. Ids the sheet no longer knows are left for the caller to drop. */
export const loadSectionOrder = (): string[] => {
  const stored = readJson(STORAGE_KEY);

  if (!Array.isArray(stored)) {
    return [];
  }

  return stored.filter((id): id is string => typeof id === "string");
};
