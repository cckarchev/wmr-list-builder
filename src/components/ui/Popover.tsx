import { useState, useRef, useEffect, useLayoutEffect, useId, type ReactNode } from 'react';
import styled from 'styled-components';
import { focusRing } from '../../theme/focusRing';

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

const Wrap = styled.div`
  position: relative;
  display: inline-flex;
`;

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[1]}px`};
  padding: ${({ theme }) => `${theme.space[1]}px ${theme.space[2]}px`};
  background: transparent;
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  color: ${({ theme }) => theme.color.text.body};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.color.border.hover};
    color: ${({ theme }) => theme.color.text.strong};
  }

  ${focusRing}
`;

const Panel = styled.div<{ $wide: boolean }>`
  position: absolute;
  top: calc(100% + ${({ theme }) => `${theme.space[1]}px`});
  left: 0;
  z-index: 30;
  width: max-content;
  max-width: ${({ $wide }) => ($wide ? 'min(520px, 92vw)' : 'min(320px, 80vw)')};
  max-height: 60vh;
  overflow-y: auto;
  padding: ${({ theme }) => `${theme.space[3]}px`};
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.shadow.panel};
  text-align: left;
`;

export default function Popover({ label, trigger, wide = false, children }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  // The panel anchors to the trigger (`left: 0`), but the trigger sits well
  // into the row, so a wide panel can overflow the right edge — and the page
  // clips horizontal overflow, hiding it. Shift the panel left just enough to
  // keep it on screen. `offsetXRef` tracks the applied shift so re-measuring
  // works from the panel's natural (un-shifted) position.
  const [offsetX, setOffsetX] = useState(0);
  const offsetXRef = useRef(0);

  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const margin = 8;
      const rect = panel.getBoundingClientRect();
      const naturalLeft = rect.left - offsetXRef.current;
      const naturalRight = rect.right - offsetXRef.current;
      let shift = 0;
      if (naturalRight > window.innerWidth - margin) {
        shift = window.innerWidth - margin - naturalRight;
      }
      if (naturalLeft + shift < margin) shift = margin - naturalLeft;
      offsetXRef.current = shift;
      setOffsetX(shift);
    };
    place();
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('resize', place);
      offsetXRef.current = 0;
      setOffsetX(0);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <Wrap ref={wrapRef}>
      <Trigger
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </Trigger>
      {open && (
        <Panel
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
          $wide={wide}
          style={{ left: offsetX }}
        >
          {children}
        </Panel>
      )}
    </Wrap>
  );
}
