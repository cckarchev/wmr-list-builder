import { type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { PillButton } from '@/components/pill-button/PillButton';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import styles from './Popover.module.css';
import { useViewportShift } from './useViewportShift';

interface PopoverProps {
  /** Accessible name shared by the trigger button and the dialog panel. */
  label: string;
  /** Visible content of the trigger button. */
  trigger: ReactNode;
  /** Widen the panel for prose-heavy content (e.g. special-rule text). */
  wide?: boolean;
  /** Panel content shown while open. */
  children: ReactNode;
}

export const Popover = ({ label, trigger, wide = false, children }: PopoverProps) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const offsetX = useViewportShift(panelRef, open);

  const close = () => setOpen(false);

  const closeAndRefocus = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useOutsideClick(wrapRef, open, close);
  useEscapeKey(open, closeAndRefocus);

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
          {children}
        </div>
      )}
    </div>
  );
};
