import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/button/Button';
import { PopupAnchor } from '../shared/popup-anchor/PopupAnchor';
import styles from './OverflowMenu.module.css';

/** Separator between groups of actions inside the menu. */
export const MenuDivider = () => <hr className={styles.divider} />;

export const OverflowMenu = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <PopupAnchor ref={wrapRef}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        More
        <span className={styles.caret} aria-hidden="true">
          ▾
        </span>
      </Button>
      {open && (
        <div className={styles.panel} role="menu">
          {children}
        </div>
      )}
    </PopupAnchor>
  );
};
