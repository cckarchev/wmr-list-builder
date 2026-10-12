import { useState } from 'react';
import { encodeListFor } from '@/core/persistence/list-codec/listCodec';
import {
  deleteNamedList,
  listSavedSummaries,
  loadNamedList,
  type SavedListSummary,
} from '@/core/persistence/savedLists';
import { snapshotOf } from '@/core/persistence/snapshot';
import { useArmyStore } from '@/store/useArmyStore';
import { useIsDirty } from '@/store/useIsDirty';

/**
 * The army's saved lists, plus loading and deleting them with the matching
 * confirmations. `onLoaded` runs after a list replaces the current one.
 */
export const useSavedLists = (onLoaded: () => void) => {
  const armyId = useArmyStore((s) => s.armyId);
  const applyList = useArmyStore((s) => s.applyList);
  const setSavedBaseline = useArmyStore((s) => s.setSavedBaseline);
  const isDirty = useIsDirty();

  const [saved, setSaved] = useState<SavedListSummary[]>([]);
  const [pendingLoad, setPendingLoad] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  /** Re-read the saved lists and drop any pending confirmation. */
  const refresh = () => {
    if (armyId) {
      setSaved(listSavedSummaries(armyId));
    }

    setPendingLoad(null);
    setPendingDelete(null);
  };

  const load = (name: string) => {
    if (!armyId) {
      return;
    }

    const snap = loadNamedList(armyId, name);

    if (!snap) {
      return;
    }

    applyList(snap);

    // Re-encode the applied state so the baseline matches what the store holds
    // (applyList clamps to force limits, so it may differ from the raw snapshot).
    const { gameSize, units } = useArmyStore.getState();
    const appliedSnapshot = snapshotOf({ gameSize, units, label: name });

    setSavedBaseline(encodeListFor(armyId, appliedSnapshot));
    setPendingLoad(null);
    onLoaded();
  };

  const requestLoad = (name: string) => {
    if (isDirty) {
      setPendingLoad(name);

      return;
    }

    load(name);
  };

  const remove = (name: string) => {
    if (!armyId) {
      return;
    }

    deleteNamedList(armyId, name);
    setPendingDelete(null);
    setSaved(listSavedSummaries(armyId));
  };

  return {
    canLoad: Boolean(armyId),
    saved,
    pendingLoad,
    pendingDelete,
    refresh,
    requestLoad,
    requestDelete: setPendingDelete,
    confirmLoad: () => pendingLoad && load(pendingLoad),
    cancelLoad: () => setPendingLoad(null),
    confirmDelete: () => pendingDelete && remove(pendingDelete),
    cancelDelete: () => setPendingDelete(null),
  };
};
