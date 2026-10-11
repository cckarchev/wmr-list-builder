import { loadArmy } from '@/data/loadArmy';
import { magicItems } from '@/data/magicItems';
import type { Army } from '@/data/types';
import { remapKeys } from './remapKeys';

export interface ListSnapshot {
  name: string;
  gameSize: number;
  units: Record<string, number>;
  upgrades: Record<string, Record<string, number>>;
}

export interface ArmyCodeMaps {
  unitCodeById: Map<string, number>;
  unitIdByCode: Map<number, string>;
  upgradeCodeById: Map<string, number>;
  upgradeIdByCode: Map<number, string>;
}

/**
 * Build id<->code lookups for a single army. Upgrade lookups include the army's
 * own upgrades plus the shared magic items (codes from MAGIC_ITEM_CODE_MIN up); unselected entries
 * simply never appear in an encoded list, so including all of them is harmless.
 */
export const buildCodeMaps = (army: Army): ArmyCodeMaps => {
  const unitCodeById = new Map<string, number>();
  const unitIdByCode = new Map<number, string>();

  for (const [id, unit] of Object.entries(army.units)) {
    unitCodeById.set(id, unit.code);
    unitIdByCode.set(unit.code, id);
  }

  const upgradeCodeById = new Map<string, number>();
  const upgradeIdByCode = new Map<number, string>();
  const upgradeSources = [
    ...Object.entries(army.upgrades ?? {}),
    ...Object.entries(magicItems.upgrades),
  ];

  for (const [id, upgrade] of upgradeSources) {
    upgradeCodeById.set(id, upgrade.code);
    upgradeIdByCode.set(upgrade.code, id);
  }

  return { unitCodeById, unitIdByCode, upgradeCodeById, upgradeIdByCode };
};

const VERSION = 1;
const PREFIX = 'wmr:list:';

interface Wire {
  v: number;
  n: string;
  g: number;
  u: Record<string, number>;
  up: Record<string, Record<string, number>>;
}

const toBase64Url = (s: string): string =>
  btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Base64 encodes in 4-character blocks; the url-safe form drops the padding. */
const BASE64_BLOCK_LENGTH = 4;

const fromBase64Url = (s: string): string => {
  const overflow = s.length % BASE64_BLOCK_LENGTH;
  const missing = overflow === 0 ? 0 : BASE64_BLOCK_LENGTH - overflow;
  const pad = '='.repeat(missing);

  return atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
};

type Counts = Record<string, number>;
type UpgradeCounts = Record<string, Counts>;

const isEmpty = (record: object): boolean => Object.keys(record).length === 0;

export const encodeList = (snap: ListSnapshot, maps: ArmyCodeMaps): string => {
  const unitCode = (id: string) => maps.unitCodeById.get(id);
  const upgradeCode = (id: string) => maps.upgradeCodeById.get(id);

  const u = remapKeys(snap.units, unitCode);

  const encodedUpgrades = remapKeys(snap.upgrades, unitCode);
  const up: UpgradeCounts = {};

  for (const [code, upgrades] of Object.entries(encodedUpgrades)) {
    const inner = remapKeys(upgrades, upgradeCode);

    if (!isEmpty(inner)) {
      up[code] = inner;
    }
  }

  const wire: Wire = { v: VERSION, n: snap.name, g: snap.gameSize, u, up };

  return toBase64Url(JSON.stringify(wire));
};

/** The wire inside an encoded blob, or null when it is unparseable or the wrong shape. */
const readWire = (s: string): Wire | null => {
  if (!s) {
    return null;
  }

  try {
    const wire = JSON.parse(fromBase64Url(s)) as Wire;
    const isCurrent = wire.v === VERSION && typeof wire.g === 'number';

    return isCurrent ? wire : null;
  } catch {
    return null;
  }
};

const wireToSnapshot = (wire: Wire, maps: ArmyCodeMaps): ListSnapshot => {
  const unitId = (code: string) => maps.unitIdByCode.get(Number(code));
  const upgradeId = (code: string) => maps.upgradeIdByCode.get(Number(code));

  const units: Counts = remapKeys(wire.u ?? {}, unitId);

  const upgrades: UpgradeCounts = {};
  const decodedUpgrades = remapKeys(wire.up ?? {}, unitId);

  for (const [id, ups] of Object.entries(decodedUpgrades)) {
    upgrades[id] = remapKeys(ups, upgradeId);
  }

  return { name: wire.n ?? '', gameSize: wire.g, units, upgrades };
};

// Shared parse/map core for both the localStorage decoder and the share decoder.
// Returns null only when the blob is unparseable or the wire is the wrong shape;
// `encodedUnitCount` is the number of unit entries the wire carried (before
// mapping), so callers can tell "wrong army" (had entries, none resolved) apart
// from "genuinely empty".
const parseWire = (
  s: string,
  maps: ArmyCodeMaps,
): { snapshot: ListSnapshot; encodedUnitCount: number } | null => {
  const wire = readWire(s);

  if (!wire) {
    return null;
  }

  // A wire with the right header can still carry malformed entries.
  try {
    return {
      snapshot: wireToSnapshot(wire, maps),
      encodedUnitCount: Object.keys(wire.u ?? {}).length,
    };
  } catch {
    return null;
  }
};

export const decodeList = (s: string, maps: ArmyCodeMaps): ListSnapshot | null =>
  parseWire(s, maps)?.snapshot ?? null;

export type DecodedShare = { ok: true; snapshot: ListSnapshot } | { ok: false };

// Decode a shared (?list=) blob, distinguishing corrupt input from a valid one.
// Corrupt = unparseable/wrong-version (parseWire null) OR the wire carried unit
// entries but none resolved against this army (wrong-army link). A genuinely
// empty shared list (no unit entries) is ok.
export const decodeShare = (s: string, maps: ArmyCodeMaps): DecodedShare => {
  const parsed = parseWire(s, maps);

  if (!parsed) {
    return { ok: false };
  }

  const isWrongArmy = parsed.encodedUnitCount > 0 && isEmpty(parsed.snapshot.units);

  if (isWrongArmy) {
    return { ok: false };
  }

  return { ok: true, snapshot: parsed.snapshot };
};

export const saveList = (armyId: string, snap: ListSnapshot): void => {
  try {
    const maps = buildCodeMaps(loadArmy(armyId));

    localStorage.setItem(PREFIX + armyId, encodeList(snap, maps));
  } catch {
    // storage blocked (private mode / partitioned iframe): degrade to in-memory
  }
};

export const loadList = (armyId: string): ListSnapshot | null => {
  try {
    const raw = localStorage.getItem(PREFIX + armyId);

    if (!raw) {
      return null;
    }

    const maps = buildCodeMaps(loadArmy(armyId));

    return decodeList(raw, maps);
  } catch {
    return null;
  }
};

const SAVED_PREFIX = 'wmr:saved:';

// Read + parse the per-army map of named lists. Returns {} on any failure
// (storage blocked, missing key, corrupt JSON) so callers stay thin.
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
  try {
    if (isEmpty(map)) {
      localStorage.removeItem(SAVED_PREFIX + armyId);
    } else {
      localStorage.setItem(SAVED_PREFIX + armyId, JSON.stringify(map));
    }
  } catch {
    // storage blocked: degrade to no-op
  }
};

export const saveNamedList = (armyId: string, name: string, snap: ListSnapshot): void => {
  try {
    const maps = buildCodeMaps(loadArmy(armyId));
    const map = readSavedMap(armyId);

    map[name] = encodeList(snap, maps);
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

    const maps = buildCodeMaps(loadArmy(armyId));

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

// Names plus lightweight metadata (game size) for each saved list, sorted by
// name. Decodes each stored blob once, sharing a single code-map build.
export const listSavedSummaries = (armyId: string): SavedListSummary[] => {
  try {
    const map = readSavedMap(armyId);
    const maps = buildCodeMaps(loadArmy(armyId));
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
