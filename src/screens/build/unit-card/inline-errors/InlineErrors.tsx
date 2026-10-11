import type { ValidationError } from '@/data/types';
import styles from './InlineErrors.module.css';

interface InlineErrorsProps {
  errors: ValidationError[];
  label?: string;
}

/** Renders the validation errors attributed to a single roster row. */
export const InlineErrors = ({ errors, label = 'Unit errors' }: InlineErrorsProps) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    // biome-ignore lint/a11y/noRedundantRoles: Safari drops list semantics when list-style is none.
    <ul className={styles.list} role="list" aria-label={label}>
      {errors.map((error) => (
        <li className={styles.item} key={error.message}>
          <span className={styles.marker} aria-hidden="true">
            !
          </span>
          {error.message}
        </li>
      ))}
    </ul>
  );
};
