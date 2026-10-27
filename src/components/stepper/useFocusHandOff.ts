import { type RefObject, useEffect, useRef } from "react";

type ButtonRef = RefObject<HTMLButtonElement | null>;

/**
 * A press that reaches an end disables the button it came from, which would
 * drop keyboard focus to the page, so focus moves to the other button. That
 * waits for the render with the new value: the other button may only just
 * have been enabled by it.
 */
export const useFocusHandOff = () => {
  const decreaseRef = useRef<HTMLButtonElement>(null);
  const increaseRef = useRef<HTMLButtonElement>(null);
  const focusAfterRender = useRef<ButtonRef | undefined>(undefined);

  useEffect(() => {
    const target = focusAfterRender.current?.current;
    focusAfterRender.current = undefined;

    if (target && !target.disabled) {
      target.focus();
    }
  });

  const handOffToIncrease = () => {
    focusAfterRender.current = increaseRef;
  };

  const handOffToDecrease = () => {
    focusAfterRender.current = decreaseRef;
  };

  return { decreaseRef, increaseRef, handOffToIncrease, handOffToDecrease };
};
