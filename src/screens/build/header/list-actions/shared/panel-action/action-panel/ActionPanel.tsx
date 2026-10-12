import { type ReactNode, type RefObject, useRef } from 'react';
import { useViewportShift } from '@/hooks/useViewportShift';
import styles from './ActionPanel.module.css';

interface ActionPanelProps {
  /** Accessible name of the dialog. */
  label: string;
  /** Visible title at the top of the panel. */
  heading: string;
  children: ReactNode;
  /** Lets the owner move focus to the panel itself, such as after a row is deleted. */
  ref?: RefObject<HTMLDivElement | null>;
}

/**
 * Dialog panel that drops down from a list action, such as Save or Load. It
 * only mounts while open, and shifts sideways when its trigger sits too close
 * to a screen edge for the panel to fit, as on a phone.
 */
export const ActionPanel = ({ label, heading, children, ref }: ActionPanelProps) => {
  const ownRef = useRef<HTMLDivElement>(null);
  const panelRef = ref ?? ownRef;
  const isOpen = true;
  const offsetX = useViewportShift(panelRef, isOpen);
  const shiftStyle = { translate: `${offsetX}px 0` };

  return (
    <div
      className={styles.panel}
      ref={panelRef}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      style={shiftStyle}
    >
      <p className={styles.heading}>{heading}</p>
      {children}
    </div>
  );
};
