import { ConfirmDialog } from '@/components/confirm-dialog/ConfirmDialog';
import { useDismissible } from '@/hooks/useDismissible';
import { PanelAction } from '../shared/panel-action/PanelAction';
import { SaveForm } from './save-form/SaveForm';
import { useSaveList } from './useSaveList';

export const SaveListButton = () => {
  const dismissible = useDismissible<HTMLSpanElement>();
  const save = useSaveList(dismissible.close);

  const overwriteDialog = (
    <ConfirmDialog
      open={save.confirmingOverwrite}
      title={`Overwrite "${save.trimmedName}"?`}
      message="A saved list with this name already exists and will be replaced."
      confirmLabel="Overwrite"
      confirmVariant="primary"
      onConfirm={save.confirmOverwrite}
      onCancel={save.cancelOverwrite}
    />
  );

  return (
    <PanelAction
      dismissible={dismissible}
      onOpen={save.reset}
      icon="save"
      label="Save"
      title="Save list"
      heading="Save list"
      disabled={!save.canSave}
      dialogs={overwriteDialog}
    >
      <SaveForm
        name={save.draft}
        error={save.error}
        onNameChange={save.changeName}
        onSave={save.requestSave}
      />
    </PanelAction>
  );
};
