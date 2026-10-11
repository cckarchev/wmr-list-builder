import styles from './Stepper.module.css';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
}

export const Stepper = ({ value, onChange, min, max, label }: StepperProps) => {
  const atMin = min !== undefined && value <= min;
  const atMax = max !== undefined && value >= max;

  const decrease = () => {
    onChange(value - 1);
  };

  const increase = () => {
    onChange(value + 1);
  };

  return (
    <div className={styles.stepper}>
      <button
        className={styles.step}
        disabled={atMin}
        onClick={decrease}
        aria-label={`decrease ${label}`}
        type="button"
      >
        −
      </button>
      <span className={styles.value}>{value}</span>
      <button
        className={styles.step}
        disabled={atMax}
        onClick={increase}
        aria-label={`increase ${label}`}
        type="button"
      >
        +
      </button>
    </div>
  );
};
