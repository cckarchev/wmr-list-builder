import { loadArmy } from '@/data/loadArmy';
import { buildCodeMaps } from './codeMaps';
import { decodeList, encodeList } from './list-codec/listCodec';
import type { ListSnapshot } from './snapshot';

const PREFIX = 'wmr:list:';

/** Remember the list being built for an army, so a reload picks it back up. */
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
