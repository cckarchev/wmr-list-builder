import { useRef, useState } from "react";
import { useEscapeKey } from "./useEscapeKey";
import { useOutsideClick } from "./useOutsideClick";

/**
 * Open state for a popup anchored in the element `ref` is attached to. While
 * open, a click outside that element or the Escape key closes it.
 *
 * Attach `triggerRef` to the button that opens the popup. Closing on Escape or
 * through `close` returns focus to it, so keyboard users don't land on <body>
 * when the popup content unmounts. An outside click leaves focus where the
 * user put it.
 */
export const useDismissible = <T extends HTMLElement>() => {
  const [open, setOpen] = useState(false);
  const ref = useRef<T>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeInPlace = () => {
    setOpen(false);
  };

  const close = () => {
    closeInPlace();
    triggerRef.current?.focus();
  };

  useOutsideClick(ref, open, closeInPlace);
  useEscapeKey(open, close);

  return { open, setOpen, close, ref, triggerRef };
};

/**
 * What `useDismissible` hands back, for components that receive it as a prop.
 */
export type Dismissible<T extends HTMLElement> = ReturnType<
  typeof useDismissible<T>
>;
