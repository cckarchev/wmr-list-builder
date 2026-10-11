import { useEffect } from 'react';
import { buildCodeMaps, decodeShare, loadList, saveList } from '@/core/persistence';
import { snapshotOf } from '@/core/snapshot';
import { loadArmy } from '@/data/loadArmy';
import { useArmyStore } from '@/store/useArmyStore';

const CORRUPT_SHARE_WARNING = 'This shared list couldn’t be loaded. The link looks corrupted.';

/**
 * Restores the list when switching to `armyId`, from a `?list=` share link
 * (`shareCode`) or else from localStorage, then auto-saves every change.
 * Returning to the same army (e.g. back from Print) keeps the current list.
 */
export const usePersistedList = (armyId: string | undefined, shareCode: string | null): void => {
  const armyIdInStore = useArmyStore((s) => s.armyId);
  const units = useArmyStore((s) => s.units);
  const gameSize = useArmyStore((s) => s.gameSize);
  const label = useArmyStore((s) => s.label);
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

    const result = decodeShare(shareCode, buildCodeMaps(loadArmy(armyId)));

    if (result.ok) {
      applyList(result.snapshot);
    } else {
      setLoadWarning(CORRUPT_SHARE_WARNING);
    }
  }, [armyId, armyIdInStore, setArmy]);

  useEffect(() => {
    if (armyIdInStore) {
      saveList(armyIdInStore, snapshotOf({ gameSize, units, label }));
    }
  }, [armyIdInStore, gameSize, units, label]);
};
