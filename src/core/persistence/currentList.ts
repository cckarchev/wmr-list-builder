import { decodeListFor, encodeListFor } from './list-codec/listCodec';
import type { ListSnapshot } from './snapshot';

const PREFIX = 'wmr:list:';

/** Remember the list being built for an army, so a reload picks it back up. */
export const saveList = (armyId: string, snap: ListSnapshot): void => {
  try {
    localStorage.setItem(PREFIX + armyId, encodeListFor(armyId, snap));
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

    return decodeListFor(armyId, raw);
  } catch {
    return null;
  }
};
