import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

/** Scrolls the window to the top once, when it mounts. */
const ScrollReset = () => {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
};

/**
 * Resets window scroll to the top whenever the route path changes.
 * Client-side navigation preserves scroll by default, which would otherwise
 * land you scrolled down (e.g. picking an army from a scrolled army list).
 * Keying on the path remounts the reset on every navigation.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  return <ScrollReset key={pathname} />;
};
