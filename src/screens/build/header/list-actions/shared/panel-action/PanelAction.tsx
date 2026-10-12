import type { ReactNode } from 'react';
import { Button } from '@/components/button/Button';
import { Icon, type IconName } from '@/components/Icon';
import type { Dismissible } from '@/hooks/useDismissible';
import { ActionPanel } from '../action-panel/ActionPanel';
import { PopupAnchor } from '../popup-anchor/PopupAnchor';

interface PanelActionProps {
  /** Open state, owned by the caller so its own hooks can close the panel. */
  dismissible: Dismissible<HTMLSpanElement>;
  /** Prepares the panel each time it opens, such as clearing a form. */
  onOpen: () => void;
  icon: IconName;
  /** Visible button label. */
  label: string;
  /** Tooltip of the button, and the accessible name of its panel. */
  title: string;
  /** Visible title at the top of the panel. */
  heading: string;
  disabled: boolean;
  /** Confirm dialogs, kept inside the anchor so clicks in them don't count as outside. */
  dialogs: ReactNode;
  /** Panel content shown while open. */
  children: ReactNode;
}

/** A list action whose button toggles a dialog panel below it, such as Save or Load. */
export const PanelAction = ({
  dismissible,
  onOpen,
  icon,
  label,
  title,
  heading,
  disabled,
  dialogs,
  children,
}: PanelActionProps) => {
  const { open, setOpen, close, ref } = dismissible;

  const togglePanel = () => {
    if (open) {
      close();

      return;
    }

    onOpen();
    setOpen(true);
  };

  return (
    <PopupAnchor ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePanel}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={title}
      >
        <Icon name={icon} />
        {label}
      </Button>
      {open && (
        <ActionPanel label={title} heading={heading}>
          {children}
        </ActionPanel>
      )}
      {dialogs}
    </PopupAnchor>
  );
};
