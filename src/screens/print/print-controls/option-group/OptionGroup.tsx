import { type ReactNode, useId } from 'react';
import styles from './OptionGroup.module.css';

interface OptionGroupProps {
  label: string;
  children: ReactNode;
}

/**
 * A labeled row of print toggles, such as Sections or Options. The visible
 * label names the fieldset, so screen readers announce it with each toggle.
 */
export const OptionGroup = ({ label, children }: OptionGroupProps) => {
  const labelId = useId();

  return (
    <fieldset className={styles.group} aria-labelledby={labelId}>
      <span className={styles.label} id={labelId}>
        {label}
      </span>
      <div className={styles.toggles}>{children}</div>
    </fieldset>
  );
};
