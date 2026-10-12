import { beforeEach, describe, expect, it } from 'vitest';
import { deleteNamedList, listSavedNames, loadNamedList, saveNamedList } from './savedLists';
import type { ListSnapshot } from './snapshot';

const ARMY = 'bretonnia';
const OTHER_ARMY = 'high-elves';
const GAME_SIZE = 2000;
const SMALL_GAME = 1000;
const LARGE_GAME = 3000;

const named = (name: string): ListSnapshot => ({
  name,
  gameSize: GAME_SIZE,
  units: {},
  upgrades: {},
});

describe('named lists', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips a saved list by name', () => {
    saveNamedList(ARMY, 'My List', named('My List'));

    const loaded = loadNamedList(ARMY, 'My List');

    expect(loaded).not.toBeNull();
    expect(loaded?.name).toBe('My List');
    expect(loaded?.gameSize).toBe(GAME_SIZE);
  });

  it('lists saved names sorted case-insensitively', () => {
    saveNamedList(ARMY, 'zeta', named('zeta'));
    saveNamedList(ARMY, 'Alpha', named('Alpha'));

    expect(listSavedNames(ARMY)).toEqual(['Alpha', 'zeta']);
  });

  it('overwrites a list saved under the same name', () => {
    const first = { ...named('dup'), gameSize: SMALL_GAME };
    const second = { ...named('dup'), gameSize: LARGE_GAME };

    saveNamedList(ARMY, 'dup', first);
    saveNamedList(ARMY, 'dup', second);

    expect(listSavedNames(ARMY)).toEqual(['dup']);
    expect(loadNamedList(ARMY, 'dup')?.gameSize).toBe(LARGE_GAME);
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

    expect(listSavedNames(OTHER_ARMY)).toEqual([]);
    expect(loadNamedList(OTHER_ARMY, 'shared-name')).toBeNull();
  });

  it('returns [] for an army with no saved lists', () => {
    expect(listSavedNames(ARMY)).toEqual([]);
  });
});
