import { codeMapsFor } from "./codeMaps";
import {
  decodeList,
  decodeListFor,
  encodeListFor,
} from "./list-codec/listCodec";
import type { ListSnapshot } from "./snapshot";
import { readJson, removeItem, writeJson } from "./storage";

const SAVED_PREFIX = "wmr:saved:";

/**
 * Read + parse the per-army map of named lists. Returns an empty map on any
 * failure (storage blocked, missing key, corrupt JSON) so callers stay thin.
 * A Map rather than the stored object, because list names are typed by the
 * user: on a plain object "constructor" would read as an inherited value and
 * "__proto__" could not be stored at all.
 */
const readSavedMap = (armyId: string): Map<string, string> => {
  const parsed = readJson(SAVED_PREFIX + armyId);
  const isMap = parsed && typeof parsed === "object" && !Array.isArray(parsed);

  if (isMap) {
    return new Map(Object.entries(parsed as Record<string, string>));
  }

  return new Map();
};

const writeSavedMap = (armyId: string, map: Map<string, string>): void => {
  const hasLists = map.size > 0;

  if (hasLists) {
    writeJson(SAVED_PREFIX + armyId, Object.fromEntries(map));
  } else {
    removeItem(SAVED_PREFIX + armyId);
  }
};

export const saveNamedList = (
  armyId: string,
  name: string,
  snap: ListSnapshot,
): void => {
  try {
    const map = readSavedMap(armyId);

    map.set(name, encodeListFor(armyId, snap));
    writeSavedMap(armyId, map);
  } catch {
    // unknown army / storage blocked: degrade to no-op
  }
};

export const loadNamedList = (
  armyId: string,
  name: string,
): ListSnapshot | null => {
  try {
    const encoded = readSavedMap(armyId).get(name);

    if (!encoded) {
      return null;
    }

    return decodeListFor(armyId, encoded);
  } catch {
    return null;
  }
};

/** Case-insensitive alphabetical order for list names. */
const byName = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { sensitivity: "base" });

export const listSavedNames = (armyId: string): string[] =>
  [...readSavedMap(armyId).keys()].sort(byName);

export interface SavedListSummary {
  name: string;
  gameSize: number;
}

/**
 * Names plus lightweight metadata (game size) for each saved list, sorted by
 * name. Decodes each stored blob once, sharing a single code-map build.
 */
export const listSavedSummaries = (armyId: string): SavedListSummary[] => {
  try {
    const map = readSavedMap(armyId);
    const maps = codeMapsFor(armyId);
    const summarize = ([name, encoded]: [string, string]): SavedListSummary => {
      const gameSize = decodeList(encoded, maps)?.gameSize ?? 0;

      return { name, gameSize };
    };

    return [...map.entries()]
      .map(summarize)
      .sort((a, b) => byName(a.name, b.name));
  } catch {
    return [];
  }
};

export const deleteNamedList = (armyId: string, name: string): void => {
  const map = readSavedMap(armyId);

  if (!map.has(name)) {
    return;
  }

  map.delete(name);
  writeSavedMap(armyId, map);
};
