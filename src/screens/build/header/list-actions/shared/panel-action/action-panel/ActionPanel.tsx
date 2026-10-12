import type { ReactNode } from 'react';
import styles from './ActionPanel.module.css';

interface ActionPanelProps {
  /** Accessible name of the dialog. */
  label: string;
  /** Visible title at the top of the panel. */
  heading: string;
  children: ReactNode;
}

/** Dialog panel that drops down from a list action, such as Save or Load. */
export const ActionPanel = ({ label, heading, children }: ActionPanelProps) => (
  <div className={styles.panel} role="dialog" aria-label={label}>
    <p className={styles.heading}>{heading}</p>
    {children}
  </div>
);
