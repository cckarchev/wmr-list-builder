import type { ReactNode } from 'react';
import { Button } from '@/components/button/Button';
import { useDismissible } from '@/hooks/useDismissible';
import { PopupAnchor } from '../shared/popup-anchor/PopupAnchor';
import styles from './OverflowMenu.module.css';

/** Separator between groups of actions inside the menu. */
export const MenuDivider = () => <hr className={styles.divider} />;

export const OverflowMenu = ({ children }: { children: ReactNode }) => {
  const { open, setOpen, ref: wrapRef } = useDismissible<HTMLSpanElement>();

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
