import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import Icon from '../ui/Icon';
import { focusRing } from '../../theme/focusRing';
import { useArmyStore } from '../../store/useArmyStore';
import { snapshotOf } from '../../store/snapshot';
import { saveNamedList, listSavedNames, encodeList, buildCodeMaps } from '../../store/persistence';
import { loadArmy } from '../../data/loadArmy';

const Wrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const Panel = styled.div`
  position: absolute;
  top: calc(100% + ${({ theme }) => `${theme.space[1]}px`});
  right: 0;
  z-index: 30;
  width: 280px;
  max-width: calc(100vw - ${({ theme }) => `${theme.space[4]}px`});
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.shadow.panel};
  text-align: left;
`;

const PanelTitle = styled.p`
  margin: 0;
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[3]}px ${theme.space[2]}px`};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.label};
  color: ${({ theme }) => theme.color.text.dim};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.divider};
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding: ${({ theme }) => `${theme.space[3]}px`};
`;

const FieldLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.label};
  color: ${({ theme }) => theme.color.text.dim};
`;

const NameInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => `${theme.space[2]}px`};
  background: ${({ theme }) => theme.color.bg.base};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.color.text.body};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  transition: border-color 0.12s;
  &:hover {
    border-color: ${({ theme }) => theme.color.border.hover};
  }
  ${focusRing}
`;

const Note = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.semantic.error};
`;

export default function SaveListButton() {
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

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const openPanel = () => {
    setName(label);
    setError(null);
    setConfirmingOverwrite(false);
    setOpen(true);
  };

  const commit = (finalName: string) => {
    if (!armyId) return;
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
    if (!armyId) return;
    if (listSavedNames(armyId).includes(trimmed)) {
      setConfirmingOverwrite(true);
      return;
    }
    commit(trimmed);
  };

  return (
    <Wrapper ref={wrapRef}>
      <Button
        $variant="ghost"
        $size="sm"
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
        <Panel role="dialog" aria-label="Save list">
          <PanelTitle>Save list</PanelTitle>
          <Body>
            <FieldLabel htmlFor="save-list-name">List name</FieldLabel>
            <NameInput
              id="save-list-name"
              value={name}
              autoFocus
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
                setConfirmingOverwrite(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
            />
            {error && <Note role="alert">{error}</Note>}
            <Button $variant="primary" $size="sm" onClick={handleSave}>
              Save list
            </Button>
          </Body>
        </Panel>
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
    </Wrapper>
  );
}
