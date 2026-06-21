import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import { useArmyStore } from '../../store/useArmyStore';
import { useIsDirty } from '../../store/useIsDirty';
import { snapshotOf } from '../../store/snapshot';
import {
  loadNamedList,
  listSavedNames,
  deleteNamedList,
  encodeList,
  buildCodeMaps,
} from '../../store/persistence';
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
  width: max-content;
  min-width: 240px;
  max-height: 60vh;
  overflow-y: auto;
  padding: ${({ theme }) => `${theme.space[2]}px`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.shadow.panel};
  text-align: left;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[1]}px`};
`;

const NameButton = styled.button`
  flex: 1;
  text-align: left;
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  background: transparent;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.color.text.body};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;
  &:hover {
    border-color: ${({ theme }) => theme.color.border.hover};
    color: ${({ theme }) => theme.color.text.strong};
  }
`;

const IconButton = styled.button`
  display: inline-flex;
  padding: ${({ theme }) => `${theme.space[1]}px`};
  background: transparent;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.color.text.dim};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.color.semantic.error};
  }
`;

const Empty = styled.p`
  margin: 0;
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
`;

const Note = styled.p`
  margin: 0;
  padding: ${({ theme }) => `0 ${theme.space[2]}px`};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
`;

export default function LoadListButton() {
  const armyId = useArmyStore((s) => s.armyId);
  const applyList = useArmyStore((s) => s.applyList);
  const setSavedBaseline = useArmyStore((s) => s.setSavedBaseline);
  const isDirty = useIsDirty();

  const [open, setOpen] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const [confirmLoad, setConfirmLoad] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
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
    if (armyId) setNames(listSavedNames(armyId));
    setConfirmLoad(null);
    setConfirmDelete(null);
    setOpen(true);
  };

  const doLoad = (name: string) => {
    if (!armyId) return;
    const snap = loadNamedList(armyId, name);
    if (!snap) return;
    applyList(snap);
    const maps = buildCodeMaps(loadArmy(armyId));
    // Re-encode the applied state so the baseline matches what the store holds
    // (applyList clamps to force limits, so it may differ from the raw snapshot).
    const { gameSize, units } = useArmyStore.getState();
    setSavedBaseline(encodeList(snapshotOf({ gameSize, units, label: name }), maps));
    setOpen(false);
  };

  const handleLoadClick = (name: string) => {
    if (isDirty) setConfirmLoad(name);
    else doLoad(name);
  };

  const doDelete = (name: string) => {
    if (!armyId) return;
    deleteNamedList(armyId, name);
    setConfirmDelete(null);
    setNames(listSavedNames(armyId));
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
        title="Load list"
      >
        <Icon name="folder" size={16} />
        Load
      </Button>
      {open && (
        <Panel role="dialog" aria-label="Load list">
          {names.length === 0 && <Empty>No saved lists for this army yet.</Empty>}
          {names.map((name) => (
            <div key={name}>
              <Row>
                <NameButton type="button" onClick={() => handleLoadClick(name)}>
                  {name}
                </NameButton>
                <IconButton
                  type="button"
                  aria-label={`delete ${name}`}
                  onClick={() => setConfirmDelete(name)}
                >
                  <Icon name="trash" size={14} />
                </IconButton>
              </Row>
              {confirmLoad === name && (
                <Row>
                  <Note>Replace current list? Unsaved changes will be lost.</Note>
                  <Button $variant="primary" $size="sm" onClick={() => doLoad(name)}>
                    Replace
                  </Button>
                </Row>
              )}
              {confirmDelete === name && (
                <Row>
                  <Note>Delete "{name}"?</Note>
                  <Button
                    $variant="ghost"
                    $size="sm"
                    aria-label={`confirm delete ${name}`}
                    onClick={() => doDelete(name)}
                  >
                    Confirm delete
                  </Button>
                </Row>
              )}
            </div>
          ))}
        </Panel>
      )}
    </Wrapper>
  );
}
