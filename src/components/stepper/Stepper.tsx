import { type RefObject, useEffect, useId, useRef } from 'react';
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
  const hintId = useId();
  const decreaseRef = useRef<HTMLButtonElement>(null);
  const increaseRef = useRef<HTMLButtonElement>(null);
  const focusAfterRender = useRef<RefObject<HTMLButtonElement | null> | undefined>(undefined);

  const isAtMin = (candidate: number): boolean => min !== undefined && candidate <= min;

  const isAtMax = (candidate: number): boolean => max !== undefined && candidate >= max;

  const atMin = isAtMin(value);
  const atMax = isAtMax(value);

  // A press that reaches an end disables the button it came from, which
  // would drop keyboard focus to the page, so focus moves to the other
  // button. That waits for the render with the new value: the other button
  // may only just have been enabled by it.
  useEffect(() => {
    const target = focusAfterRender.current?.current;
    focusAfterRender.current = undefined;

    if (target && !target.disabled) {
      target.focus();
    }
  });

  const decrease = () => {
    const next = value - STEP;
    onChange(next);

    if (isAtMin(next)) {
      focusAfterRender.current = increaseRef;
    }
  };

  const increase = () => {
    const next = value + STEP;
    onChange(next);

    if (isAtMax(next)) {
      focusAfterRender.current = decreaseRef;
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
