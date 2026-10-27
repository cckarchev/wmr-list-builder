import { useEffect, useRef } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog/ConfirmDialog";
import { useDismissible } from "@/hooks/useDismissible";
import { PanelAction } from "../shared/panel-action/PanelAction";
import styles from "./LoadListButton.module.css";
import { SavedListItem } from "./saved-list-item/SavedListItem";
import { useSavedLists } from "./useSavedLists";

export const LoadListButton = () => {
  const dismissible = useDismissible<HTMLSpanElement>();
  // Deleting a list unmounts the row that opened the confirm dialog, so focus
  // falls back to the panel instead of dropping to <body>.
  const panelRef = useRef<HTMLDivElement>(null);
  const lists = useSavedLists(dismissible.close);
  const isEmpty = lists.saved.length === 0;

  // The panel has no field to focus, unlike Save, so it takes the focus
  // itself and a screen reader announces it as it opens.
  useEffect(() => {
    if (dismissible.open) {
      panelRef.current?.focus();
    }
  }, [dismissible.open]);

  const confirmDialogs = (
    <>
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
        title={`Delete "${lists.pendingDelete ?? ""}"?`}
        message="This saved list will be removed permanently."
        confirmLabel="Delete"
        onConfirm={lists.confirmDelete}
        onCancel={lists.cancelDelete}
        fallbackFocusRef={panelRef}
      />
    </>
  );

  return (
    <PanelAction
      dismissible={dismissible}
      onOpen={lists.refresh}
      icon="folder"
      label="Load"
      title="Load list"
      heading="Saved lists"
      disabled={!lists.canLoad}
      dialogs={confirmDialogs}
      panelRef={panelRef}
    >
      {isEmpty && (
        <p className={styles.empty}>No saved lists for this army yet.</p>
      )}
      {lists.saved.map(({ name, gameSize }) => (
        <SavedListItem
          key={name}
          name={name}
          gameSize={gameSize}
          onLoad={lists.requestLoad}
          onDelete={lists.requestDelete}
        />
      ))}
    </PanelAction>
  );
};
