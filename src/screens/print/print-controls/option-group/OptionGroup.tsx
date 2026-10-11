import type { ReactNode } from 'react';
import styles from './OptionGroup.module.css';

interface OptionGroupProps {
  label: string;
  children: ReactNode;
}

/** A labeled row of print toggles, such as Sections or Options. */
export const OptionGroup = ({ label, children }: OptionGroupProps) => (
  <div className={styles.group}>
    <span className={styles.label}>{label}</span>
    <div className={styles.toggles}>{children}</div>
  </div>
);
