import { decodeListFor, encodeListFor } from "./list-codec/listCodec";
import type { ListSnapshot } from "./snapshot";
import { readItem, writeItem } from "./storage";

const PREFIX = "wmr:list:";

/** Remember the list being built for an army, so a reload picks it back up. */
export const saveList = (armyId: string, snap: ListSnapshot): void => {
  try {
    writeItem(PREFIX + armyId, encodeListFor(armyId, snap));
  } catch {
    // unknown army: nothing to save
  }
};

export const loadList = (armyId: string): ListSnapshot | null => {
  const raw = readItem(PREFIX + armyId);

  if (!raw) {
    return null;
  }

  try {
    return decodeListFor(armyId, raw);
  } catch {
    // unknown army: nothing to restore
    return null;
  }
};
