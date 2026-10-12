import type { ReactNode, Ref } from 'react';
import styles from './ActionPanel.module.css';

interface ActionPanelProps {
  /** Accessible name of the dialog. */
  label: string;
  /** Visible title at the top of the panel. */
  heading: string;
  children: ReactNode;
  /** Lets the owner move focus to the panel itself, such as after a row is deleted. */
  ref?: Ref<HTMLDivElement>;
}

/** Dialog panel that drops down from a list action, such as Save or Load. */
export const ActionPanel = ({ label, heading, children, ref }: ActionPanelProps) => (
  <div className={styles.panel} ref={ref} role="dialog" aria-label={label} tabIndex={-1}>
    <p className={styles.heading}>{heading}</p>
    {children}
  </div>
);
