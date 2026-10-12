import styles from './Stat.module.css';

interface StatProps {
  label: string;
  value: number;
  /** Shows the value in the error color, e.g. points over the game size. */
  over?: boolean;
  testId?: string;
}

/** A labelled number in the header's status strip. */
export const Stat = ({ label, value, over = false, testId }: StatProps) => (
  <div className={styles.stat}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value} data-over={over || undefined} data-testid={testId}>
      {value}
    </span>
  </div>
);
