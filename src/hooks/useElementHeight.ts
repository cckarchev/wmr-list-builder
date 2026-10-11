import { type RefCallback, useEffect, useState } from 'react';

interface ElementHeight<T extends HTMLElement> {
  /** Attach to the element to measure. */
  ref: RefCallback<T>;
  height: number;
}

/**
 * Live height in pixels of the element `ref` is attached to, tracked with a
 * ResizeObserver. Measuring starts as soon as the element mounts. Returns 0
 * while nothing is attached.
 */
export const useElementHeight = <T extends HTMLElement>(): ElementHeight<T> => {
  const [element, setElement] = useState<T | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!element) {
      return;
    }

    const update = () => setHeight(element.offsetHeight);
    const observer = new ResizeObserver(update);

    update();
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return { ref: setElement, height };
};
