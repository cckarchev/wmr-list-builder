import { describe, expect, it } from 'vitest';
import { loadArmy } from '@/data/loadArmy';
import { buildCodeMaps } from '../codeMaps';
import type { ListSnapshot } from '../snapshot';
import { decodeList, decodeShare, encodeList, encodeListFor } from './listCodec';

const maps = buildCodeMaps(loadArmy('empire'));

// Real empire names so they resolve in the maps. (Game-legality is irrelevant
// to the codec; the maps map every defined name.)
const snap: ListSnapshot = {
  name: '',
  gameSize: 2000,
  units: { halberdiers: 4, crossbowmen: 2 },
  upgrades: { halberdiers: { griffon: 1 } },
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
      units: { halberdiers: 1, 'Not A Unit': 3 },
      upgrades: {},
    };
    expect(decodeList(encodeList(dirty, maps), maps)).toEqual({
      name: '',
      gameSize: 1000,
      units: { halberdiers: 1 },
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

  it('returns null for a current wire with malformed upgrade entries', () => {
    const unitCode = maps.unitCodeById.get('halberdiers');
    const malformed = btoa(
      JSON.stringify({ v: 1, n: '', g: snap.gameSize, u: {}, up: { [String(unitCode)]: null } }),
    );

    expect(decodeList(malformed, maps)).toBeNull();
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

describe('encodeListFor', () => {
  it('encodes a snapshot with the code maps of the given army', () => {
    expect(encodeListFor('empire', snap)).toBe(encodeList(snap, maps));
  });
});
