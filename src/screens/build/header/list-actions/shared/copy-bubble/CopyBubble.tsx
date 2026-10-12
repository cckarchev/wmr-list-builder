import type { ReactNode } from 'react';
import styles from './CopyBubble.module.css';

interface CopyBubbleProps {
  children: ReactNode;
}

/** Floating feedback, "copied" or "failed", shown under a copy action. */
export const CopyBubble = ({ children }: CopyBubbleProps) => (
  <span className={styles.bubble}>{children}</span>
);
