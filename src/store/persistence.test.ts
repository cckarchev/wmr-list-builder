import { describe, it, expect, beforeEach } from 'vitest';
import {
  encodeList,
  decodeList,
  decodeShare,
  saveList,
  loadList,
  buildCodeMaps,
  saveNamedList,
  loadNamedList,
  listSavedNames,
  deleteNamedList,
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

describe('named lists', () => {
  const ARMY = 'bretonnia';
  const named = (name: string): ListSnapshot => ({
    name,
    gameSize: 2000,
    units: {},
    upgrades: {},
  });

  beforeEach(() => localStorage.clear());

  it('round-trips a saved list by name', () => {
    saveNamedList(ARMY, 'My List', named('My List'));
    const loaded = loadNamedList(ARMY, 'My List');
    expect(loaded).not.toBeNull();
    expect(loaded?.name).toBe('My List');
    expect(loaded?.gameSize).toBe(2000);
  });

  it('lists saved names sorted case-insensitively', () => {
    saveNamedList(ARMY, 'zeta', named('zeta'));
    saveNamedList(ARMY, 'Alpha', named('Alpha'));
    expect(listSavedNames(ARMY)).toEqual(['Alpha', 'zeta']);
  });

  it('overwrites a list saved under the same name', () => {
    saveNamedList(ARMY, 'dup', { ...named('dup'), gameSize: 1000 });
    saveNamedList(ARMY, 'dup', { ...named('dup'), gameSize: 3000 });
    expect(listSavedNames(ARMY)).toEqual(['dup']);
    expect(loadNamedList(ARMY, 'dup')?.gameSize).toBe(3000);
  });

  it('deletes one list and leaves the others', () => {
    saveNamedList(ARMY, 'a', named('a'));
    saveNamedList(ARMY, 'b', named('b'));
    deleteNamedList(ARMY, 'a');
    expect(listSavedNames(ARMY)).toEqual(['b']);
    expect(loadNamedList(ARMY, 'a')).toBeNull();
  });

  it('isolates saved lists per army', () => {
    saveNamedList(ARMY, 'shared-name', named('shared-name'));
    expect(listSavedNames('high-elves')).toEqual([]);
    expect(loadNamedList('high-elves', 'shared-name')).toBeNull();
  });

  it('returns [] for an army with no saved lists', () => {
    expect(listSavedNames(ARMY)).toEqual([]);
  });
});
