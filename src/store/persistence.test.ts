import { describe, it, expect, beforeEach } from 'vitest';
import {
  encodeList,
  decodeList,
  decodeShare,
  saveList,
  loadList,
  buildCodeMaps,
  type ListSnapshot,
} from './persistence';
import { loadArmy } from '../data/loadArmy';

const maps = buildCodeMaps(loadArmy('empire'));

// Real empire names so they resolve in the maps. (Game-legality is irrelevant
// to the codec; the maps map every defined name.)
const snap: ListSnapshot = {
  name: '',
  gameSize: 2000,
  units: { Halberdiers: 4, Crossbowmen: 2 },
  upgrades: { Halberdiers: { Griffon: 1 } },
};

describe('encode/decode list', () => {
  it('round-trips a snapshot through ids', () => {
    expect(decodeList(encodeList(snap, maps), maps)).toEqual(snap);
  });

  it('preserves the list name', () => {
    const named = { ...snap, name: 'My Big List' };
    expect(decodeList(encodeList(named, maps), maps)?.name).toBe('My Big List');
  });

  it('skips unknown unit/upgrade names on encode', () => {
    const dirty: ListSnapshot = {
      name: '',
      gameSize: 1000,
      units: { Halberdiers: 1, 'Not A Unit': 3 },
      upgrades: {},
    };
    expect(decodeList(encodeList(dirty, maps), maps)).toEqual({
      name: '',
      gameSize: 1000,
      units: { Halberdiers: 1 },
      upgrades: {},
    });
  });

  it('is materially shorter than the name-based encoding', () => {
    const idBased = encodeList(snap, maps);
    const nameBased = btoa(
      JSON.stringify({ v: 1, n: '', g: snap.gameSize, u: snap.units, up: snap.upgrades }),
    );
    expect(idBased.length).toBeLessThan(nameBased.length);
  });

  it('returns null for garbage', () => {
    expect(decodeList('not-base64!!', maps)).toBeNull();
    expect(decodeList('', maps)).toBeNull();
  });

  it('returns null for a wrong version', () => {
    const bad = btoa(JSON.stringify({ v: 99, n: '', g: 2000, u: {}, up: {} }));
    expect(decodeList(bad, maps)).toBeNull();
  });
});

describe('decodeShare', () => {
  it('reports ok with the snapshot for a valid blob', () => {
    const r = decodeShare(encodeList(snap, maps), maps);
    expect(r).toEqual({ ok: true, snapshot: snap });
  });

  it('reports ok for a genuinely empty shared list', () => {
    const empty = { name: '', gameSize: 1500, units: {}, upgrades: {} };
    const r = decodeShare(encodeList(empty, maps), maps);
    expect(r).toEqual({ ok: true, snapshot: empty });
  });

  it('reports not-ok for an unparseable blob', () => {
    expect(decodeShare('notjson', maps)).toEqual({ ok: false });
    expect(decodeShare('', maps)).toEqual({ ok: false });
  });

  it('reports not-ok for a wrong version', () => {
    const bad = btoa(JSON.stringify({ v: 99, n: '', g: 2000, u: {}, up: {} }));
    expect(decodeShare(bad, maps)).toEqual({ ok: false });
  });

  it('reports not-ok when units were present but none resolve (wrong army)', () => {
    // ids 900/901 exist in no army's unit map → all dropped.
    const wrongArmy = btoa(JSON.stringify({ v: 1, n: '', g: 2000, u: { 900: 2, 901: 1 }, up: {} }));
    expect(decodeShare(wrongArmy, maps)).toEqual({ ok: false });
  });
});

describe('localStorage persistence', () => {
  beforeEach(() => localStorage.clear());

  it('saves and loads per army', () => {
    saveList('empire', snap);
    expect(loadList('empire')).toEqual(snap);
    expect(loadList('goblin')).toBeNull();
  });
});
