import { useEffect, useEffectEvent } from "react";

type EscapeHandler = () => void;

/**
 * Active handlers, oldest first. Escape only reaches the last one, so a
 * confirm dialog opened over a panel closes alone and the panel stays open.
 */
const handlerStack: EscapeHandler[] = [];

const dispatchEscape = (event: KeyboardEvent) => {
  const topHandler = handlerStack.at(-1);

  if (event.key !== "Escape" || !topHandler) {
    return;
  }

  topHandler();
};

const pushHandler = (handler: EscapeHandler) => {
  if (handlerStack.length === 0) {
    document.addEventListener("keydown", dispatchEscape);
  }

  handlerStack.push(handler);
};

const removeHandler = (handler: EscapeHandler) => {
  const index = handlerStack.lastIndexOf(handler);

  if (index !== -1) {
    handlerStack.splice(index, 1);
  }

  if (handlerStack.length === 0) {
    document.removeEventListener("keydown", dispatchEscape);
  }
};

/**
 * While `active`, calls `onEscape` whenever the Escape key is pressed, unless
 * a handler activated later is still active above it.
 */
export const useEscapeKey = (active: boolean, onEscape: () => void): void => {
  const handleEscape = useEffectEvent(onEscape);

  useEffect(() => {
    if (!active) {
      return;
    }

    const handler = () => {
      handleEscape();
    };

    pushHandler(handler);

    return () => removeHandler(handler);
  }, [active]);
};
