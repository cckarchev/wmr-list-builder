import { type RefObject, useEffect, useEffectEvent } from "react";

/** While `active`, calls `onOutside` on any mousedown outside `ref`'s element. */
export const useOutsideClick = (
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onOutside: () => void,
): void => {
  const handleOutside = useEffectEvent(onOutside);

  useEffect(() => {
    if (!active) {
      return;
    }

    const onDown = (event: MouseEvent) => {
      const element = ref.current;
      const isOutside =
        element !== null && !element.contains(event.target as Node);

      if (isOutside) {
        handleOutside();
      }
    };

    document.addEventListener("mousedown", onDown);

    return () => document.removeEventListener("mousedown", onDown);
  }, [active, ref]);
};
