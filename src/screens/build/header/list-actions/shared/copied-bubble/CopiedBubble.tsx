import type { ReactNode } from 'react';
import styles from './CopiedBubble.module.css';

interface CopiedBubbleProps {
  children: ReactNode;
}

/** Floating feedback, "copied" or "failed", shown under a copy action. */
export const CopiedBubble = ({ children }: CopiedBubbleProps) => (
  <span className={styles.bubble}>{children}</span>
);
