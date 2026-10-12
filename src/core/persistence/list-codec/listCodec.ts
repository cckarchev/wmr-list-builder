import { type ArmyCodeMaps, codeMapsFor } from '../codeMaps';
import type { ListSnapshot } from '../snapshot';
import { fromBase64Url, toBase64Url } from './base64Url';
import { remapKeys } from './remapKeys';

const VERSION = 1;

interface Wire {
  v: number;
  n: string;
  g: number;
  u: Record<string, number>;
  up: Record<string, Record<string, number>>;
}

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

/** Encode a snapshot with the code maps of the army with this id. */
export const encodeListFor = (armyId: string, snap: ListSnapshot): string =>
  encodeList(snap, codeMapsFor(armyId));

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

/**
 * Shared parse/map core for both the localStorage decoder and the share decoder.
 * Returns null only when the blob is unparseable or the wire is the wrong shape;
 * `encodedUnitCount` is the number of unit entries the wire carried (before
 * mapping), so callers can tell "wrong army" (had entries, none resolved) apart
 * from "genuinely empty".
 */
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

/** Decode a blob with the code maps of the army with this id. */
export const decodeListFor = (armyId: string, s: string): ListSnapshot | null =>
  decodeList(s, codeMapsFor(armyId));

type DecodedShare = { ok: true; snapshot: ListSnapshot } | { ok: false };

/**
 * Decode a shared (?list=) blob, distinguishing corrupt input from a valid one.
 * Corrupt = unparseable/wrong-version (parseWire null) OR the wire carried unit
 * entries but none resolved against this army (wrong-army link). A genuinely
 * empty shared list (no unit entries) is ok.
 */
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

/** Decode a shared blob with the code maps of the army with this id. */
export const decodeShareFor = (armyId: string, s: string): DecodedShare =>
  decodeShare(s, codeMapsFor(armyId));
