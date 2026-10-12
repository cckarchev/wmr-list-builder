import { Button } from '@/components/button/Button';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { Icon } from '@/components/Icon';
import { useDismissible } from '@/hooks/useDismissible';
import { ActionPanel } from '../shared/action-panel/ActionPanel';
import { PopupAnchor } from '../shared/popup-anchor/PopupAnchor';
import styles from './LoadListButton.module.css';
import { SavedListItem } from './saved-list-item/SavedListItem';
import { useSavedLists } from './useSavedLists';

export const LoadListButton = () => {
  const { open, setOpen, close, ref: wrapRef } = useDismissible<HTMLSpanElement>();
  const lists = useSavedLists(close);
  const isEmpty = lists.saved.length === 0;

  const togglePanel = () => {
    if (open) {
      close();

      return;
    }

    lists.refresh();
    setOpen(true);
  };

  return (
    <PopupAnchor ref={wrapRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePanel}
        disabled={!lists.canLoad}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Load list"
      >
        <Icon name="folder" />
        Load
      </Button>
      {open && (
        <ActionPanel label="Load list" heading="Saved lists" wide>
          {isEmpty && <p className={styles.empty}>No saved lists for this army yet.</p>}
          {lists.saved.map(({ name, gameSize }) => (
            <SavedListItem
              key={name}
              name={name}
              gameSize={gameSize}
              onLoad={lists.requestLoad}
              onDelete={lists.requestDelete}
            />
          ))}
        </ActionPanel>
      )}
      <ConfirmDialog
        open={lists.pendingLoad !== null}
        title="Replace current list?"
        message="Unsaved changes will be lost."
        confirmLabel="Replace"
        onConfirm={lists.confirmLoad}
        onCancel={lists.cancelLoad}
      />
      <ConfirmDialog
        open={lists.pendingDelete !== null}
        title={`Delete "${lists.pendingDelete ?? ''}"?`}
        message="This saved list will be removed permanently."
        confirmLabel="Delete"
        onConfirm={lists.confirmDelete}
        onCancel={lists.cancelDelete}
      />
    </PopupAnchor>
  );
};
