import { codeMapsFor } from './codeMaps';
import { decodeList, encodeListFor } from './list-codec/listCodec';
import type { ListSnapshot } from './snapshot';

const SAVED_PREFIX = 'wmr:saved:';

/**
 * Read + parse the per-army map of named lists. Returns {} on any failure
 * (storage blocked, missing key, corrupt JSON) so callers stay thin.
 */
const readSavedMap = (armyId: string): Record<string, string> => {
  try {
    const raw = localStorage.getItem(SAVED_PREFIX + armyId);

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    const isMap = parsed && typeof parsed === 'object' && !Array.isArray(parsed);

    if (isMap) {
      return parsed as Record<string, string>;
    }

    return {};
  } catch {
    return {};
  }
};

const writeSavedMap = (armyId: string, map: Record<string, string>): void => {
  const hasLists = Object.keys(map).length > 0;

  try {
    if (hasLists) {
      localStorage.setItem(SAVED_PREFIX + armyId, JSON.stringify(map));
    } else {
      localStorage.removeItem(SAVED_PREFIX + armyId);
    }
  } catch {
    // storage blocked: degrade to no-op
  }
};

export const saveNamedList = (armyId: string, name: string, snap: ListSnapshot): void => {
  try {
    const map = readSavedMap(armyId);

    map[name] = encodeListFor(armyId, snap);
    writeSavedMap(armyId, map);
  } catch {
    // unknown army / storage blocked: degrade to no-op
  }
};

export const loadNamedList = (armyId: string, name: string): ListSnapshot | null => {
  try {
    const encoded = readSavedMap(armyId)[name];

    if (!encoded) {
      return null;
    }

    const maps = codeMapsFor(armyId);

    return decodeList(encoded, maps);
  } catch {
    return null;
  }
};

/** Case-insensitive alphabetical order for list names. */
const byName = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { sensitivity: 'base' });

export const listSavedNames = (armyId: string): string[] =>
  Object.keys(readSavedMap(armyId)).sort(byName);

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
    const summarize = (name: string): SavedListSummary => {
      const gameSize = decodeList(map[name], maps)?.gameSize ?? 0;

      return { name, gameSize };
    };

    return Object.keys(map).sort(byName).map(summarize);
  } catch {
    return [];
  }
};

export const deleteNamedList = (armyId: string, name: string): void => {
  const map = readSavedMap(armyId);

  if (!(name in map)) {
    return;
  }

  delete map[name];
  writeSavedMap(armyId, map);
};
