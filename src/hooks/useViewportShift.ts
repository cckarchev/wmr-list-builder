import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import { viewportShift } from "@/core/lib/viewportShift";

/** Minimum gap kept between the panel and the viewport edges. */
const VIEWPORT_MARGIN = 8;

/**
 * Horizontal offset that keeps an open panel on screen. The panel anchors to
 * its trigger, which can sit well into a row, so a wide panel may overflow the
 * right edge, where the page clips it. `appliedRef` tracks the current shift
 * so re-measuring works from the panel's natural (un-shifted) position.
 */
export const useViewportShift = (
  panelRef: RefObject<HTMLElement | null>,
  open: boolean,
): number => {
  const [offsetX, setOffsetX] = useState(0);
  const appliedRef = useRef(0);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const place = () => {
      const panel = panelRef.current;

      if (!panel) {
        return;
      }

      const rect = panel.getBoundingClientRect();
      const natural = {
        left: rect.left - appliedRef.current,
        right: rect.right - appliedRef.current,
      };
      const shift = viewportShift(natural, window.innerWidth, VIEWPORT_MARGIN);

      appliedRef.current = shift;
      setOffsetX(shift);
    };

    place();
    window.addEventListener("resize", place);

    return () => {
      window.removeEventListener("resize", place);
      appliedRef.current = 0;
      setOffsetX(0);
    };
  }, [open, panelRef]);

  return offsetX;
};
