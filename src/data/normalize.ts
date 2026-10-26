import type { Army, MagicItemsFile, RawArmy, RawMagicItemsFile } from "./types";

/**
 * Key a list of entities by their id, keeping list order. Throws on a
 * duplicate id, since a later entity would silently replace the earlier one.
 */
export const indexById = <T extends { id: string }>(
  entities: T[],
  label: string,
): Record<string, T> => {
  const indexed: Record<string, T> = {};

  for (const entity of entities) {
    if (Object.hasOwn(indexed, entity.id)) {
      throw new Error(`Duplicate id in ${label}: ${entity.id}`);
    }

    indexed[entity.id] = entity;
  }

  return indexed;
};

/** Index an optional list, keeping `undefined` when the army has none. */
const indexOptional = <T extends { id: string }>(
  entities: T[] | undefined,
  label: string,
): Record<string, T> | undefined => {
  if (!entities) {
    return undefined;
  }

  return indexById(entities, label);
};

/**
 * Turn a stored army (entity lists) into the runtime `Army` (records by id).
 */
export const normalizeArmy = (raw: RawArmy): Army => {
  const label = raw.name;

  return {
    ...raw,
    units: indexById(raw.units, `${label} units`),
    upgrades: indexOptional(raw.upgrades, `${label} upgrades`),
    specialRules: indexOptional(raw.specialRules, `${label} special rules`),
  };
};

/** Turn the stored magic items (a list) into a record by id. */
export const normalizeMagicItems = (
  raw: RawMagicItemsFile,
): MagicItemsFile => ({
  ...raw,
  upgrades: indexById(raw.upgrades, "magic items"),
});
