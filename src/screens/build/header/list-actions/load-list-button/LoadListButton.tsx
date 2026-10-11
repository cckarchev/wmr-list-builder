import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/button/Button';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { Icon } from '@/components/Icon';
import {
  buildCodeMaps,
  deleteNamedList,
  encodeList,
  listSavedSummaries,
  loadNamedList,
  type SavedListSummary,
} from '@/core/persistence';
import { snapshotOf } from '@/core/snapshot';
import { loadArmy } from '@/data/loadArmy';
import { useArmyStore } from '@/store/useArmyStore';
import { useIsDirty } from '@/store/useIsDirty';
import { ActionPanel } from '../shared/action-panel/ActionPanel';
import { PopupAnchor } from '../shared/popup-anchor/PopupAnchor';
import styles from './LoadListButton.module.css';

export const LoadListButton = () => {
  const armyId = useArmyStore((s) => s.armyId);
  const applyList = useArmyStore((s) => s.applyList);
  const setSavedBaseline = useArmyStore((s) => s.setSavedBaseline);
  const isDirty = useIsDirty();

  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<SavedListSummary[]>([]);
  const [confirmLoad, setConfirmLoad] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openPanel = () => {
    if (armyId) {
      setSaved(listSavedSummaries(armyId));
    }
    setConfirmLoad(null);
    setConfirmDelete(null);
    setOpen(true);
  };

  const doLoad = (name: string) => {
    if (!armyId) {
      return;
    }
    const snap = loadNamedList(armyId, name);
    if (!snap) {
      return;
    }
    applyList(snap);
    const maps = buildCodeMaps(loadArmy(armyId));
    // Re-encode the applied state so the baseline matches what the store holds
    // (applyList clamps to force limits, so it may differ from the raw snapshot).
    const { gameSize, units } = useArmyStore.getState();
    setSavedBaseline(encodeList(snapshotOf({ gameSize, units, label: name }), maps));
    setConfirmLoad(null);
    setOpen(false);
  };

  const handleLoadClick = (name: string) => {
    if (isDirty) {
      setConfirmLoad(name);
    } else {
      doLoad(name);
    }
  };

  const doDelete = (name: string) => {
    if (!armyId) {
      return;
    }
    deleteNamedList(armyId, name);
    setConfirmDelete(null);
    setSaved(listSavedSummaries(armyId));
  };

  return (
    <PopupAnchor ref={wrapRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => (open ? setOpen(false) : openPanel())}
        disabled={!armyId}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Load list"
      >
        <Icon name="folder" size={16} />
        Load
      </Button>
      {open && (
        <ActionPanel label="Load list" heading="Saved lists" wide>
          {saved.length === 0 && <p className={styles.empty}>No saved lists for this army yet.</p>}
          {saved.map(({ name, gameSize }) => (
            <div className={styles.item} key={name}>
              <div className={styles.row}>
                <button className={styles.name} type="button" onClick={() => handleLoadClick(name)}>
                  <span className={styles.title}>{name}</span>
                  <span className={styles.size} aria-hidden="true">
                    {gameSize} pts
                  </span>
                </button>
                <button
                  className={styles.delete}
                  type="button"
                  aria-label={`delete ${name}`}
                  onClick={() => setConfirmDelete(name)}
                >
                  <Icon name="trash" size={14} />
                </button>
              </div>
            </div>
          ))}
        </ActionPanel>
      )}
      <ConfirmDialog
        open={confirmLoad !== null}
        title="Replace current list?"
        message="Unsaved changes will be lost."
        confirmLabel="Replace"
        onConfirm={() => confirmLoad && doLoad(confirmLoad)}
        onCancel={() => setConfirmLoad(null)}
      />
      <ConfirmDialog
        open={confirmDelete !== null}
        title={`Delete "${confirmDelete ?? ''}"?`}
        message="This saved list will be removed permanently."
        confirmLabel="Delete"
        onConfirm={() => confirmDelete && doDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </PopupAnchor>
  );
};
