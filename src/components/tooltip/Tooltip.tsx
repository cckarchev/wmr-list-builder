import { type ReactNode, useId } from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  /** The full text shown in the bubble on hover/focus. */
  label: string;
  /** The visible trigger (e.g. a terse badge). */
  children: ReactNode;
}

/**
 * Lightweight CSS-only tooltip: shows `label` in a bubble above `children` on
 * hover or keyboard focus. The bubble text is always in the DOM (so it's
 * available to assistive tech and tests) and merely revealed via opacity.
 */
export const Tooltip = ({ label, children }: TooltipProps) => {
  const bubbleId = useId();

  return (
    // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users need focus to reveal the bubble.
    <span className={styles.wrap} tabIndex={0} aria-describedby={bubbleId}>
      {children}
      <span className={styles.bubble} id={bubbleId} role="tooltip">
        {label}
      </span>
    </span>
  );
};
