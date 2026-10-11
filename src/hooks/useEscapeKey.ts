import { useEffect, useEffectEvent } from 'react';

/** While `active`, calls `onEscape` whenever the Escape key is pressed. */
export const useEscapeKey = (active: boolean, onEscape: () => void): void => {
  const handleEscape = useEffectEvent(onEscape);

  useEffect(() => {
    if (!active) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleEscape();
      }
    };

    document.addEventListener('keydown', onKey);

    return () => document.removeEventListener('keydown', onKey);
  }, [active]);
};
