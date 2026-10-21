import { useEffect } from "react";
import { loadList, saveList } from "@/core/persistence/currentList";
import { decodeShareFor } from "@/core/persistence/list-codec/listCodec";
import { useArmyStore } from "@/store/useArmyStore";
import { useListSnapshot } from "@/store/useListSnapshot";

const CORRUPT_SHARE_WARNING =
  "This shared list couldn’t be loaded. The link looks corrupted.";

/**
 * Restores the list when switching to `armyId`, from a `?list=` share link
 * (`shareCode`) or else from localStorage, then auto-saves every change.
 * Returning to the same army (e.g. back from Print) keeps the current list.
 */
export const usePersistedList = (
  armyId: string | undefined,
  shareCode: string | null,
): void => {
  const armyIdInStore = useArmyStore((s) => s.armyId);
  const snapshot = useListSnapshot();
  const setArmy = useArmyStore((s) => s.setArmy);
  const applyList = useArmyStore((s) => s.applyList);
  const setLoadWarning = useArmyStore((s) => s.setLoadWarning);

  useEffect(() => {
    const alreadyLoaded = !armyId || armyIdInStore === armyId;

    if (alreadyLoaded) {
      return;
    }

    // Also clears any prior loadWarning.
    setArmy(armyId);

    if (!shareCode) {
      const saved = loadList(armyId);

      if (saved) {
        applyList(saved);
      }

      return;
    }

    const result = decodeShareFor(armyId, shareCode);

    if (result.ok) {
      applyList(result.snapshot);
    } else {
      setLoadWarning(CORRUPT_SHARE_WARNING);
    }
  }, [armyId, armyIdInStore, shareCode, setArmy, applyList, setLoadWarning]);

  useEffect(() => {
    if (armyIdInStore) {
      saveList(armyIdInStore, snapshot);
    }
  }, [armyIdInStore, snapshot]);
};
