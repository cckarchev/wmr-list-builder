import { type ReactNode, useId, useRef, useState } from 'react';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { useViewportShift } from '@/hooks/useViewportShift';
import styles from './Tooltip.module.css';
import { useTooltipPlacement } from './useTooltipPlacement';

interface TooltipProps {
  /** The full text shown in the bubble on hover, focus or tap. */
  label: string;
  /** The visible trigger (e.g. a terse badge). */
  children: ReactNode;
  /**
   * The bubble's id, when a control inside the trigger should point at the
   * bubble too, such as a disabled button described by why it is disabled.
   */
  id?: string;
}

/**
 * Small tooltip: shows `label` in a bubble above `children` on hover, keyboard
 * focus or a tap, since touch screens have no hover. The bubble text is always
 * in the DOM (so it's available to assistive tech and tests) and merely
 * revealed by CSS. It shifts sideways when the trigger sits too close to
 * a screen edge for the bubble to fit, and opens below when there is no room
 * above.
 */
export const Tooltip = ({ label, children, id }: TooltipProps) => {
  const ownId = useId();
  const bubbleId = id ?? ownId;
  const wrapRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const offsetX = useViewportShift(bubbleRef, isOpen);
  const placement = useTooltipPlacement(wrapRef, bubbleRef, isOpen);
  const shiftStyle = { translate: `${offsetX}px 0` };

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  useEscapeKey(isOpen, close);
  useOutsideClick(wrapRef, isOpen, close);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover only reveals text already exposed through aria-describedby.
    <span
      className={styles.wrap}
      ref={wrapRef}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: focus reveals the bubble, both from the keyboard and from a tap.
      tabIndex={0}
      aria-describedby={bubbleId}
      data-open={isOpen}
      data-placement={placement}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      <span
        className={styles.bubble}
        ref={bubbleRef}
        id={bubbleId}
        role="tooltip"
        style={shiftStyle}
      >
        {label}
      </span>
    </span>
  );
};
