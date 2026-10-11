import { type ReactNode, useRef, useState } from 'react';
import { Button } from '@/components/button/Button';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { PopupAnchor } from '../shared/popup-anchor/PopupAnchor';
import styles from './OverflowMenu.module.css';

/** Separator between groups of actions inside the menu. */
export const MenuDivider = () => <hr className={styles.divider} />;

export const OverflowMenu = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const close = () => setOpen(false);

  useOutsideClick(wrapRef, open, close);
  useEscapeKey(open, close);

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
