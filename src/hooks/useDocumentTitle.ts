import { useEffect } from 'react';

/**
 * Sets the browser document title while the calling screen is mounted, and
 * puts the previous title back on leaving. An empty title leaves it alone.
 */
export const useDocumentTitle = (title: string): void => {
  useEffect(() => {
    if (!title) {
      return;
    }

    const previousTitle = document.title;
    document.title = title;

    return () => {
      document.title = previousTitle;
    };
  }, [title]);
};
