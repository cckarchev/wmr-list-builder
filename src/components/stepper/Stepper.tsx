import { useId } from "react";
import { Tooltip } from "@/components/tooltip/Tooltip";
import styles from "./Stepper.module.css";
import { useFocusHandOff } from "./useFocusHandOff";

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

export const Stepper = ({
  value,
  onChange,
  min,
  max,
  label,
  maxedHint,
}: StepperProps) => {
  const hintId = useId();
  const { decreaseRef, increaseRef, handOffToIncrease, handOffToDecrease } =
    useFocusHandOff();

  const isAtMin = (candidate: number): boolean =>
    min !== undefined && candidate <= min;

  const isAtMax = (candidate: number): boolean =>
    max !== undefined && candidate >= max;

  const atMin = isAtMin(value);
  const atMax = isAtMax(value);

  const decrease = () => {
    const next = value - STEP;
    onChange(next);

    if (isAtMin(next)) {
      handOffToIncrease();
    }
  };

  const increase = () => {
    const next = value + STEP;
    onChange(next);

    if (isAtMax(next)) {
      handOffToDecrease();
    }
  };

  // A disabled button can't take focus, so the tooltip's own wrapper is what
  // a tap or the keyboard reaches to read why. The button points at the same
  // text, so a screen reader reading it also hears why it is disabled.
  const showMaxedHint = atMax && maxedHint !== undefined;

  const increaseButton = (
    <button
      className={styles.step}
      ref={increaseRef}
      disabled={atMax}
      onClick={increase}
      aria-label={`increase ${label}`}
      aria-describedby={showMaxedHint ? hintId : undefined}
      type="button"
    >
      +
    </button>
  );

  return (
    <div className={styles.stepper}>
      <button
        className={styles.step}
        ref={decreaseRef}
        disabled={atMin}
        onClick={decrease}
        aria-label={`decrease ${label}`}
        type="button"
      >
        −
      </button>
      <span className={styles.value}>{value}</span>
      {showMaxedHint ? (
        <Tooltip label={maxedHint} id={hintId}>
          {increaseButton}
        </Tooltip>
      ) : (
        increaseButton
      )}
    </div>
  );
};
