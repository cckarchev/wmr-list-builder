import { Tooltip } from '@/components/tooltip/Tooltip';
import styles from './Stepper.module.css';

/** How much one press of either button changes the value. */
const STEP = 1;

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  /** Why the value can't go higher, shown as a tooltip on the spent increase button. */
  maxedHint?: string;
}

export const Stepper = ({ value, onChange, min, max, label, maxedHint }: StepperProps) => {
  const atMin = min !== undefined && value <= min;
  const atMax = max !== undefined && value >= max;

  const decrease = () => {
    onChange(value - STEP);
  };

  const increase = () => {
    onChange(value + STEP);
  };

  const increaseButton = (
    <button
      className={styles.step}
      disabled={atMax}
      onClick={increase}
      aria-label={`increase ${label}`}
      type="button"
    >
      +
    </button>
  );

  // A disabled button can't take focus, so the tooltip's own wrapper is what
  // a tap or the keyboard reaches to read why.
  const showMaxedHint = atMax && maxedHint !== undefined;

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
      {showMaxedHint ? <Tooltip label={maxedHint}>{increaseButton}</Tooltip> : increaseButton}
    </div>
  );
};
