import { useEffect, useState } from 'react';

/**
 * Live height in pixels of the first element matching `selector`, tracked
 * with a ResizeObserver. `remeasureKey` re-runs the lookup when it changes,
 * e.g. once the element has mounted. Returns 0 while nothing matches.
 */
export const useElementHeight = (selector: string, remeasureKey: unknown): number => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const element = document.querySelector<HTMLElement>(selector);

    if (!element) {
      return;
    }

    const update = () => setHeight(element.offsetHeight);
    const observer = new ResizeObserver(update);

    update();
    observer.observe(element);

    return () => observer.disconnect();
  }, [selector, remeasureKey]);

  return height;
};
