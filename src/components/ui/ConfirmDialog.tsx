import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import Button from './Button';

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

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.space[4]}px`};
  background: ${({ theme }) => theme.alpha(theme.rgb.black, 0.6)};
`;

const Card = styled.div`
  width: 100%;
  max-width: 380px;
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.shadow.panel};
  text-align: left;
`;

const Title = styled.p`
  margin: 0;
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[4]}px ${theme.space[2]}px`};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.label};
  color: ${({ theme }) => theme.color.text.dim};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.divider};
`;

const Message = styled.p`
  margin: 0;
  padding: ${({ theme }) => `${theme.space[4]}px`};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.color.text.body};
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding: ${({ theme }) => `0 ${theme.space[4]}px ${theme.space[4]}px`};
`;

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const messageId = useId();
  const backdropRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  // These dialogs open from inside popovers whose dismiss-on-outside-click is a
  // native `document` mousedown listener. Swallow mousedown at the backdrop so
  // clicking the dialog doesn't also close the popover behind it.
  useEffect(() => {
    const el = backdropRef.current;
    if (!open || !el) return;
    const stop = (e: MouseEvent) => e.stopPropagation();
    el.addEventListener('mousedown', stop);
    return () => el.removeEventListener('mousedown', stop);
  }, [open]);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return createPortal(
    <Backdrop
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <Card
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
      >
        <Title id={titleId}>{title}</Title>
        <Message id={messageId}>{message}</Message>
        <Actions>
          <Button $variant="ghost" $size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} $variant={confirmVariant} $size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Actions>
      </Card>
    </Backdrop>,
    document.body,
  );
}
