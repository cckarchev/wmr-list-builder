import { type ReactNode, useEffect, useId, useRef } from 'react';
import { PillButton } from '@/components/pill-button/PillButton';
import { useDismissible } from '@/hooks/useDismissible';
import styles from './Popover.module.css';
import { useViewportShift } from './useViewportShift';

interface PopoverProps {
  /** Accessible name shared by the trigger button and the dialog panel. */
  label: string;
  /** Visible title in the bar at the top of the panel. */
  heading: string;
  /** Visible content of the trigger button. */
  trigger: ReactNode;
  /** Widen the panel for prose-heavy content (e.g. special-rule text). */
  wide?: boolean;
  /** Panel content shown while open. */
  children: ReactNode;
}

export const Popover = ({ label, heading, trigger, wide = false, children }: PopoverProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const { open, setOpen, ref: wrapRef, triggerRef } = useDismissible<HTMLDivElement>();
  const offsetX = useViewportShift(panelRef, open);

  useEffect(() => {
    if (open) {
      panelRef.current?.focus();
    }
  }, [open]);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <PillButton
        ref={triggerRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </PillButton>
      {open && (
        <div
          className={styles.panel}
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
          data-wide={wide || undefined}
          style={{ left: offsetX }}
        >
          <p className={styles.heading}>{heading}</p>
          <div className={styles.body}>{children}</div>
        </div>
      )}
    </div>
  );
};
