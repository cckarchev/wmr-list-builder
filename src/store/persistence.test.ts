import { describe, it, expect, beforeEach } from 'vitest';
import { encodeList, decodeList, saveList, loadList, type ListSnapshot } from './persistence';

describe('encode/decode list', () => {
  const snap: ListSnapshot = {
    gameSize: 2000,
    units: { Knights: 2, General: 1 },
    upgrades: { General: { 'Battle Standard': 1 } },
  };

  it('round-trips a snapshot', () => {
    expect(decodeList(encodeList(snap))).toEqual(snap);
  });

  it('returns null for garbage', () => {
    expect(decodeList('not-base64!!')).toBeNull();
    expect(decodeList('')).toBeNull();
  });

  it('returns null for a wrong version', () => {
    const bad = btoa(JSON.stringify({ v: 99, g: 2000, u: {}, up: {} }));
    expect(decodeList(bad)).toBeNull();
  });
});

describe('localStorage persistence', () => {
  beforeEach(() => localStorage.clear());

  const snap: ListSnapshot = { gameSize: 1000, units: { General: 1 }, upgrades: {} };

  it('saves and loads per army', () => {
    saveList('empire', snap);
    expect(loadList('empire')).toEqual(snap);
    expect(loadList('goblin')).toBeNull();
  });
});
