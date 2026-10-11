import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/button/Button';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { Icon } from '@/components/Icon';
import { buildCodeMaps, encodeList, listSavedNames, saveNamedList } from '@/core/persistence';
import { snapshotOf } from '@/core/snapshot';
import { loadArmy } from '@/data/loadArmy';
import { useArmyStore } from '@/store/useArmyStore';
import { ActionPanel } from '../shared/action-panel/ActionPanel';
import { PopupAnchor } from '../shared/popup-anchor/PopupAnchor';
import styles from './SaveListButton.module.css';

export const SaveListButton = () => {
  const armyId = useArmyStore((s) => s.armyId);
  const gameSize = useArmyStore((s) => s.gameSize);
  const units = useArmyStore((s) => s.units);
  const label = useArmyStore((s) => s.label);
  const setLabel = useArmyStore((s) => s.setLabel);
  const setSavedBaseline = useArmyStore((s) => s.setSavedBaseline);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [confirmingOverwrite, setConfirmingOverwrite] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const openPanel = () => {
    setName(label);
    setError(null);
    setConfirmingOverwrite(false);
    setOpen(true);
  };

  const commit = (finalName: string) => {
    if (!armyId) {
      return;
    }
    const maps = buildCodeMaps(loadArmy(armyId));
    const snap = snapshotOf({ gameSize, units, label: finalName });
    saveNamedList(armyId, finalName, snap);
    setLabel(finalName);
    setSavedBaseline(encodeList(snap, maps));
    setConfirmingOverwrite(false);
    setOpen(false);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a name for this list.');
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

  return (
    <PopupAnchor ref={wrapRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => (open ? setOpen(false) : openPanel())}
        disabled={!armyId}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Save list"
      >
        <Icon name="save" size={16} />
        Save
      </Button>
      {open && (
        <ActionPanel label="Save list" heading="Save list">
          <div className={styles.body}>
            <label className={styles.label} htmlFor="save-list-name">
              List name
            </label>
            <input
              className={styles.input}
              ref={inputRef}
              id="save-list-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
                setConfirmingOverwrite(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
            {error && (
              <p className={styles.note} role="alert">
                {error}
              </p>
            )}
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save list
            </Button>
          </div>
        </ActionPanel>
      )}
      <ConfirmDialog
        open={confirmingOverwrite}
        title={`Overwrite "${name.trim()}"?`}
        message="A saved list with this name already exists and will be replaced."
        confirmLabel="Overwrite"
        confirmVariant="primary"
        onConfirm={() => commit(name.trim())}
        onCancel={() => setConfirmingOverwrite(false)}
      />
    </PopupAnchor>
  );
};
