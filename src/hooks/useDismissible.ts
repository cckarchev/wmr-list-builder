import { useRef, useState } from 'react';
import { useEscapeKey } from './useEscapeKey';
import { useOutsideClick } from './useOutsideClick';

interface DismissibleOptions {
  /** Runs after the popup closes on Escape, such as returning focus to its trigger. */
  onEscape?: () => void;
}

/**
 * Open state for a popup anchored in the element `ref` is attached to. While
 * open, a click outside that element or the Escape key closes it.
 */
export const useDismissible = <T extends HTMLElement>({ onEscape }: DismissibleOptions = {}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<T>(null);

  const close = () => setOpen(false);

  const closeOnEscape = () => {
    close();
    onEscape?.();
  };

  useOutsideClick(ref, open, close);
  useEscapeKey(open, closeOnEscape);

  return { open, setOpen, close, ref };
};

/** What `useDismissible` hands back, for components that receive it as a prop. */
export type Dismissible<T extends HTMLElement> = ReturnType<typeof useDismissible<T>>;
