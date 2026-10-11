import { useRef, useState } from 'react';
import { useEscapeKey } from './useEscapeKey';
import { useOutsideClick } from './useOutsideClick';

/**
 * Open state for a popup anchored in the element `ref` is attached to. While
 * open, a click outside that element or the Escape key closes it.
 */
export const useDismissible = <T extends HTMLElement>() => {
  const [open, setOpen] = useState(false);
  const ref = useRef<T>(null);

  const close = () => setOpen(false);

  useOutsideClick(ref, open, close);
  useEscapeKey(open, close);

  return { open, setOpen, close, ref };
};
