import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets window scroll to the top whenever the route path changes.
 * Client-side navigation preserves scroll by default, which would otherwise
 * land you scrolled down (e.g. picking an army from a scrolled army list).
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
