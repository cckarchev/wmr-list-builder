import type { Army } from '../data/types';
import { magicItems } from '../data/magicItems';
import { loadArmy } from '../data/loadArmy';

export interface ListSnapshot {
  name: string;
  gameSize: number;
  units: Record<string, number>;
  upgrades: Record<string, Record<string, number>>;
}

export interface ArmyCodeMaps {
  unitIdByName: Map<string, number>;
  unitNameById: Map<number, string>;
  upgradeIdByName: Map<string, number>;
  upgradeNameById: Map<number, string>;
}

/**
 * Build name<->id lookups for a single army. Upgrade lookups include the army's
 * own upgrades plus the shared magic items (ids >= 100); unselected entries
 * simply never appear in an encoded list, so including all of them is harmless.
 */
export function buildCodeMaps(army: Army): ArmyCodeMaps {
  const unitIdByName = new Map<string, number>();
  const unitNameById = new Map<number, string>();
  for (const [name, unit] of Object.entries(army.units)) {
    unitIdByName.set(name, unit.id);
    unitNameById.set(unit.id, name);
  }

  const upgradeIdByName = new Map<string, number>();
  const upgradeNameById = new Map<number, string>();
  for (const [name, up] of Object.entries(army.upgrades ?? {})) {
    upgradeIdByName.set(name, up.id);
    upgradeNameById.set(up.id, name);
  }
  for (const [name, item] of Object.entries(magicItems.upgrades)) {
    upgradeIdByName.set(name, item.id);
    upgradeNameById.set(item.id, name);
  }

  return { unitIdByName, unitNameById, upgradeIdByName, upgradeNameById };
}

const VERSION = 1;
const PREFIX = 'wmr:list:';

interface Wire {
  v: number;
  n: string;
  g: number;
  u: Record<string, number>;
  up: Record<string, Record<string, number>>;
}

function toBase64Url(s: string): string {
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
}

export function encodeList(snap: ListSnapshot, maps: ArmyCodeMaps): string {
  const u: Record<string, number> = {};
  for (const [name, count] of Object.entries(snap.units)) {
    const id = maps.unitIdByName.get(name);
    if (id !== undefined) u[id] = count;
  }

  const up: Record<string, Record<string, number>> = {};
  for (const [unitName, ups] of Object.entries(snap.upgrades)) {
    const unitId = maps.unitIdByName.get(unitName);
    if (unitId === undefined) continue;
    const inner: Record<string, number> = {};
    for (const [upName, count] of Object.entries(ups)) {
      const upId = maps.upgradeIdByName.get(upName);
      if (upId !== undefined) inner[upId] = count;
    }
    if (Object.keys(inner).length > 0) up[unitId] = inner;
  }

  const wire: Wire = { v: VERSION, n: snap.name, g: snap.gameSize, u, up };
  return toBase64Url(JSON.stringify(wire));
}

// Shared parse/map core for both the localStorage decoder and the share decoder.
// Returns null only when the blob is unparseable or the wire is the wrong shape;
// `encodedUnitCount` is the number of unit entries the wire carried (before
// mapping), so callers can tell "wrong army" (had entries, none resolved) apart
// from "genuinely empty".
function parseWire(
  s: string,
  maps: ArmyCodeMaps,
): { snapshot: ListSnapshot; encodedUnitCount: number } | null {
  if (!s) return null;
  try {
    const wire = JSON.parse(fromBase64Url(s)) as Wire;
    if (wire.v !== VERSION || typeof wire.g !== 'number') return null;

    const wireUnits = wire.u ?? {};
    const units: Record<string, number> = {};
    for (const [idStr, count] of Object.entries(wireUnits)) {
      const name = maps.unitNameById.get(Number(idStr));
      if (name !== undefined) units[name] = count;
    }

    const upgrades: Record<string, Record<string, number>> = {};
    for (const [unitIdStr, ups] of Object.entries(wire.up ?? {})) {
      const unitName = maps.unitNameById.get(Number(unitIdStr));
      if (unitName === undefined) continue;
      const inner: Record<string, number> = {};
      for (const [upIdStr, count] of Object.entries(ups)) {
        const upName = maps.upgradeNameById.get(Number(upIdStr));
        if (upName !== undefined) inner[upName] = count;
      }
      upgrades[unitName] = inner;
    }

    return {
      snapshot: { name: wire.n ?? '', gameSize: wire.g, units, upgrades },
      encodedUnitCount: Object.keys(wireUnits).length,
    };
  } catch {
    return null;
  }
}

export function decodeList(s: string, maps: ArmyCodeMaps): ListSnapshot | null {
  return parseWire(s, maps)?.snapshot ?? null;
}

export type DecodedShare = { ok: true; snapshot: ListSnapshot } | { ok: false };

// Decode a shared (?list=) blob, distinguishing corrupt input from a valid one.
// Corrupt = unparseable/wrong-version (parseWire null) OR the wire carried unit
// entries but none resolved against this army (wrong-army link). A genuinely
// empty shared list (no unit entries) is ok.
export function decodeShare(s: string, maps: ArmyCodeMaps): DecodedShare {
  const r = parseWire(s, maps);
  if (!r) return { ok: false };
  if (r.encodedUnitCount > 0 && Object.keys(r.snapshot.units).length === 0) {
    return { ok: false };
  }
  return { ok: true, snapshot: r.snapshot };
}

export function saveList(armyId: string, snap: ListSnapshot): void {
  try {
    const maps = buildCodeMaps(loadArmy(armyId));
    localStorage.setItem(PREFIX + armyId, encodeList(snap, maps));
  } catch {
    // storage blocked (private mode / partitioned iframe) — degrade to in-memory
  }
}

export function loadList(armyId: string): ListSnapshot | null {
  try {
    const raw = localStorage.getItem(PREFIX + armyId);
    if (!raw) return null;
    const maps = buildCodeMaps(loadArmy(armyId));
    return decodeList(raw, maps);
  } catch {
    return null;
  }
}

const SAVED_PREFIX = 'wmr:saved:';

// Read + parse the per-army map of named lists. Returns {} on any failure
// (storage blocked, missing key, corrupt JSON) so callers stay thin.
function readSavedMap(armyId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(SAVED_PREFIX + armyId);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
    return {};
  } catch {
    return {};
  }
}

function writeSavedMap(armyId: string, map: Record<string, string>): void {
  try {
    if (Object.keys(map).length === 0) {
      localStorage.removeItem(SAVED_PREFIX + armyId);
    } else {
      localStorage.setItem(SAVED_PREFIX + armyId, JSON.stringify(map));
    }
  } catch {
    // storage blocked — degrade to no-op
  }
}

export function saveNamedList(armyId: string, name: string, snap: ListSnapshot): void {
  try {
    const maps = buildCodeMaps(loadArmy(armyId));
    const map = readSavedMap(armyId);
    map[name] = encodeList(snap, maps);
    writeSavedMap(armyId, map);
  } catch {
    // unknown army / storage blocked — degrade to no-op
  }
}

export function loadNamedList(armyId: string, name: string): ListSnapshot | null {
  try {
    const encoded = readSavedMap(armyId)[name];
    if (!encoded) return null;
    const maps = buildCodeMaps(loadArmy(armyId));
    return decodeList(encoded, maps);
  } catch {
    return null;
  }
}

export function listSavedNames(armyId: string): string[] {
  return Object.keys(readSavedMap(armyId)).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' }),
  );
}

export interface SavedListSummary {
  name: string;
  gameSize: number;
}

// Names plus lightweight metadata (game size) for each saved list, sorted by
// name. Decodes each stored blob once, sharing a single code-map build.
export function listSavedSummaries(armyId: string): SavedListSummary[] {
  try {
    const map = readSavedMap(armyId);
    const maps = buildCodeMaps(loadArmy(armyId));
    return Object.keys(map)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
      .map((name) => ({ name, gameSize: decodeList(map[name], maps)?.gameSize ?? 0 }));
  } catch {
    return [];
  }
}

export function deleteNamedList(armyId: string, name: string): void {
  const map = readSavedMap(armyId);
  if (!(name in map)) return;
  delete map[name];
  writeSavedMap(armyId, map);
}
