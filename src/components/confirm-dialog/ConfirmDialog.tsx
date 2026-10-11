import { type ReactNode, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/button/Button';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const titleId = useId();
  const messageId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  // These dialogs open from inside popovers whose dismiss-on-outside-click is a
  // native `document` mousedown listener. Swallow mousedown at the backdrop so
  // clicking the dialog doesn't also close the popover behind it.
  useEffect(() => {
    const el = backdropRef.current;
    if (!open || !el) {
      return;
    }
    const stop = (e: MouseEvent) => e.stopPropagation();
    el.addEventListener('mousedown', stop);
    return () => el.removeEventListener('mousedown', stop);
  }, [open]);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    // Escape closes the dialog through the document listener above, so the
    // backdrop click is only a pointer convenience.
    // biome-ignore lint/a11y/noStaticElementInteractions: pointer-only dismiss, see above.
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard dismiss is the Escape listener.
    <div
      className={styles.backdrop}
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className={styles.card}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
      >
        <p className={styles.title} id={titleId}>
          {title}
        </p>
        <p className={styles.message} id={messageId}>
          {message}
        </p>
        <div className={styles.actions}>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} variant={confirmVariant} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
