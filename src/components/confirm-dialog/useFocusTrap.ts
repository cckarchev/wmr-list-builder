import { type RefObject, useEffect } from 'react';

/** Elements a keyboard user can Tab to. */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/** The element Tab should land on next, or undefined to let the browser move on. */
const wrapTarget = (container: HTMLElement, backwards: boolean): HTMLElement | undefined => {
  const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  const first = focusables.at(0);
  const last = focusables.at(-1);
  const current = document.activeElement;
  const isOutside = !container.contains(current);

  if (!first || !last) {
    return undefined;
  }

  if (backwards && (current === first || isOutside)) {
    return last;
  }

  if (!backwards && (current === last || isOutside)) {
    return first;
  }

  return undefined;
};

/**
 * While `active`, keeps Tab and Shift+Tab cycling inside `containerRef`, as a
 * modal promises, and hands focus back to whatever had it once `active` ends.
 */
export const useFocusTrap = (containerRef: RefObject<HTMLElement | null>, active: boolean) => {
  useEffect(() => {
    if (!active) {
      return;
    }

    const previouslyFocused = document.activeElement;

    const keepTabInside = (event: KeyboardEvent) => {
      const container = containerRef.current;

      if (event.key !== 'Tab' || !container) {
        return;
      }

      const target = wrapTarget(container, event.shiftKey);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.focus();
    };

    document.addEventListener('keydown', keepTabInside);

    return () => {
      document.removeEventListener('keydown', keepTabInside);

      // The opener may have unmounted with the dialog, such as a row that was
      // just deleted. Then there is nothing to go back to.
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, [active, containerRef]);
};
