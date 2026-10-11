import { useRef, useState } from 'react';
import { Button } from '@/components/button/Button';
import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { Icon } from '@/components/Icon';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { ActionPanel } from '../shared/action-panel/ActionPanel';
import { PopupAnchor } from '../shared/popup-anchor/PopupAnchor';
import { SaveForm } from './save-form/SaveForm';
import { useSaveList } from './useSaveList';

export const SaveListButton = () => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const close = () => setOpen(false);
  const save = useSaveList(close);

  useOutsideClick(wrapRef, open, close);
  useEscapeKey(open, close);

  const togglePanel = () => {
    if (open) {
      close();
      return;
    }

    save.reset();
    setOpen(true);
  };

  return (
    <PopupAnchor ref={wrapRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePanel}
        disabled={!save.canSave}
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Save list"
      >
        <Icon name="save" size={16} />
        Save
      </Button>
      {open && (
        <ActionPanel label="Save list" heading="Save list">
          <SaveForm
            name={save.draft}
            error={save.error}
            onNameChange={save.changeName}
            onSave={save.requestSave}
          />
        </ActionPanel>
      )}
      <ConfirmDialog
        open={save.confirmingOverwrite}
        title={`Overwrite "${save.trimmedName}"?`}
        message="A saved list with this name already exists and will be replaced."
        confirmLabel="Overwrite"
        confirmVariant="primary"
        onConfirm={save.confirmOverwrite}
        onCancel={save.cancelOverwrite}
      />
    </PopupAnchor>
  );
};
