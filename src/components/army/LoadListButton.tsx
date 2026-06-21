import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';
import Icon from '../ui/Icon';
import { focusRing } from '../../theme/focusRing';
import { useArmyStore } from '../../store/useArmyStore';
import { useIsDirty } from '../../store/useIsDirty';
import { snapshotOf } from '../../store/snapshot';
import {
  loadNamedList,
  listSavedSummaries,
  deleteNamedList,
  encodeList,
  buildCodeMaps,
  type SavedListSummary,
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
  width: 300px;
  max-width: calc(100vw - ${({ theme }) => `${theme.space[4]}px`});
  max-height: 60vh;
  overflow-y: auto;
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

const Item = styled.div`
  & + & {
    border-top: 1px solid ${({ theme }) => theme.color.border.divider};
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
`;

const NameButton = styled.button`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => `${theme.space[3]}px`};
  text-align: left;
  padding: ${({ theme }) => `${theme.space[2]}px ${theme.space[3]}px`};
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.color.text.body};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  cursor: pointer;
  transition:
    background 0.12s,
    color 0.12s;
  &:hover {
    background: ${({ theme }) => theme.color.bg.tint};
    color: ${({ theme }) => theme.color.text.strong};
  }
  ${focusRing}
`;

const ListTitle = styled.span`
  min-width: 0;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SizeBadge = styled.span`
  flex-shrink: 0;
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  background: ${({ theme }) => theme.color.bg.deep};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
`;

const IconButton = styled.button`
  display: inline-flex;
  margin-right: ${({ theme }) => `${theme.space[2]}px`};
  padding: ${({ theme }) => `${theme.space[1]}px`};
  background: transparent;
  border: 1px solid transparent;
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.color.text.dim};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.color.semantic.error};
  }
  ${focusRing}
`;

const Empty = styled.p`
  margin: 0;
  padding: ${({ theme }) => `${theme.space[2]}px ${theme.space[3]}px`};
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme }) => theme.color.text.dim};
`;

export default function LoadListButton() {
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
    if (armyId) setSaved(listSavedSummaries(armyId));
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
    setConfirmLoad(null);
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
    setSaved(listSavedSummaries(armyId));
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
          <PanelTitle>Saved lists</PanelTitle>
          {saved.length === 0 && <Empty>No saved lists for this army yet.</Empty>}
          {saved.map(({ name, gameSize }) => (
            <Item key={name}>
              <Row>
                <NameButton type="button" onClick={() => handleLoadClick(name)}>
                  <ListTitle>{name}</ListTitle>
                  <SizeBadge aria-hidden="true">{gameSize} pts</SizeBadge>
                </NameButton>
                <IconButton
                  type="button"
                  aria-label={`delete ${name}`}
                  onClick={() => setConfirmDelete(name)}
                >
                  <Icon name="trash" size={14} />
                </IconButton>
              </Row>
            </Item>
          ))}
        </Panel>
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
    </Wrapper>
  );
}
