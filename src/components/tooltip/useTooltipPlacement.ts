import { type RefObject, useLayoutEffect, useState } from 'react';
import { fitsAbove } from '@/core/lib/fitsAbove';

export type TooltipPlacement = 'above' | 'below';

/** Set by the Build screen to the measured height of its sticky header. */
const TOP_INSET_PROPERTY = '--header-height';
const NO_INSET = 0;

const readTopInset = (element: HTMLElement): number => {
  const value = getComputedStyle(element).getPropertyValue(TOP_INSET_PROPERTY);
  const inset = Number.parseFloat(value);

  return Number.isNaN(inset) ? NO_INSET : inset;
};

/**
 * Opens the bubble above its trigger unless it would cross the top of the
 * viewport or slide under the sticky header, and below it otherwise. It is
 * measured each time the bubble opens, while it still sits above.
 */
export const useTooltipPlacement = (
  triggerRef: RefObject<HTMLElement | null>,
  bubbleRef: RefObject<HTMLElement | null>,
  open: boolean,
): TooltipPlacement => {
  const [placement, setPlacement] = useState<TooltipPlacement>('above');

  useLayoutEffect(() => {
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;

    if (!open || !trigger || !bubble) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const isRoomAbove = fitsAbove({
      triggerTop: triggerRect.top,
      bubbleHeight: bubbleRect.height,
      gap: triggerRect.top - bubbleRect.bottom,
      topInset: readTopInset(trigger),
    });

    setPlacement(isRoomAbove ? 'above' : 'below');

    return () => {
      setPlacement('above');
    };
  }, [open, triggerRef, bubbleRef]);

  return placement;
};
