import { type ReactNode, useId } from "react";
import { Button } from "@/components/button/Button";
import { useDismissible } from "@/hooks/useDismissible";
import { PopupAnchor } from "../shared/popup-anchor/PopupAnchor";
import styles from "./OverflowMenu.module.css";

/** Separator between groups of actions inside the panel. */
export const MenuDivider = () => <hr className={styles.divider} />;

/**
 * The "More" disclosure. Not an ARIA menu: its actions are plain buttons and
 * links reached with Tab, so a menu role would promise arrow-key navigation.
 */
export const OverflowMenu = ({ children }: { children: ReactNode }) => {
  const {
    open,
    setOpen,
    ref: wrapRef,
    triggerRef,
  } = useDismissible<HTMLSpanElement>();
  const panelId = useId();

  return (
    <PopupAnchor ref={wrapRef}>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        More
        <span className={styles.caret} aria-hidden="true">
          ▾
        </span>
      </Button>
      {open && (
        // biome-ignore lint/a11y/useSemanticElements: a fieldset implies a form; this groups action buttons.
        <div
          className={styles.panel}
          id={panelId}
          role="group"
          aria-label="More list actions"
        >
          {children}
        </div>
      )}
    </PopupAnchor>
  );
};
