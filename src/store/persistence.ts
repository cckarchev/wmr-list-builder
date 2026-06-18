export interface ListSnapshot {
  gameSize: number;
  units: Record<string, number>;
  upgrades: Record<string, Record<string, number>>;
}

const VERSION = 1;
const PREFIX = 'wmr:list:';

interface Wire {
  v: number;
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

export function encodeList(snap: ListSnapshot): string {
  const wire: Wire = { v: VERSION, g: snap.gameSize, u: snap.units, up: snap.upgrades };
  return toBase64Url(JSON.stringify(wire));
}

export function decodeList(s: string): ListSnapshot | null {
  if (!s) return null;
  try {
    const wire = JSON.parse(fromBase64Url(s)) as Wire;
    if (wire.v !== VERSION || typeof wire.g !== 'number') return null;
    return { gameSize: wire.g, units: wire.u ?? {}, upgrades: wire.up ?? {} };
  } catch {
    return null;
  }
}

export function saveList(armyId: string, snap: ListSnapshot): void {
  try {
    localStorage.setItem(PREFIX + armyId, encodeList(snap));
  } catch {
    // storage blocked (private mode / partitioned iframe) — degrade to in-memory
  }
}

export function loadList(armyId: string): ListSnapshot | null {
  try {
    const raw = localStorage.getItem(PREFIX + armyId);
    return raw ? decodeList(raw) : null;
  } catch {
    return null;
  }
}
