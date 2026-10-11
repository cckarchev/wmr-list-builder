import { useState } from 'react';
import { encodeListFor } from '@/core/persistence/list-codec/listCodec';
import { listSavedNames, saveNamedList } from '@/core/persistence/savedLists';
import { snapshotOf } from '@/core/persistence/snapshot';
import { useArmyStore } from '@/store/useArmyStore';

const EMPTY_NAME_ERROR = 'Enter a name for this list.';

/**
 * Draft name, validation and overwrite confirmation for saving the current
 * list. `onSaved` runs after a successful save, e.g. to close the panel.
 */
export const useSaveList = (onSaved: () => void) => {
  const armyId = useArmyStore((s) => s.armyId);
  const gameSize = useArmyStore((s) => s.gameSize);
  const units = useArmyStore((s) => s.units);
  const label = useArmyStore((s) => s.label);
  const setLabel = useArmyStore((s) => s.setLabel);
  const setSavedBaseline = useArmyStore((s) => s.setSavedBaseline);

  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmingOverwrite, setConfirmingOverwrite] = useState(false);

  /** Start a fresh draft from the list's current label. */
  const reset = () => {
    setName(label);
    setError(null);
    setConfirmingOverwrite(false);
  };

  const changeName = (value: string) => {
    setName(value);
    setError(null);
    setConfirmingOverwrite(false);
  };

  const commit = (finalName: string) => {
    if (!armyId) {
      return;
    }

    const snap = snapshotOf({ gameSize, units, label: finalName });

    saveNamedList(armyId, finalName, snap);
    setLabel(finalName);
    setSavedBaseline(encodeListFor(armyId, snap));
    setConfirmingOverwrite(false);
    onSaved();
  };

  const requestSave = () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setError(EMPTY_NAME_ERROR);

      return;
    }

    if (!armyId) {
      return;
    }

    if (listSavedNames(armyId).includes(trimmed)) {
      setConfirmingOverwrite(true);

      return;
    }

    commit(trimmed);
  };

  const trimmedName = name.trim();

  return {
    canSave: Boolean(armyId),
    draft: name,
    trimmedName,
    error,
    confirmingOverwrite,
    reset,
    changeName,
    requestSave,
    confirmOverwrite: () => commit(trimmedName),
    cancelOverwrite: () => setConfirmingOverwrite(false),
  };
};
