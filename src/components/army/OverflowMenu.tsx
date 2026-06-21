import { useState, useRef, useEffect, type ReactNode } from 'react';
import styled from 'styled-components';
import Button from '../ui/Button';

const Wrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const Panel = styled.div`
  position: absolute;
  top: calc(100% + ${({ theme }) => `${theme.space[1]}px`});
  right: 0;
  z-index: 30;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  padding: ${({ theme }) => `${theme.space[2]}px`};
  background: ${({ theme }) => theme.color.bg.surface};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.shadow.panel};

  /* Stretch every action to a uniform full width. Copy/Share/Reset are wrapped
     in inline-flex spans, so stretch the wrappers and let the inner buttons grow;
     the Print button is a direct child and stretches on its own. */
  & > * {
    width: 100%;
  }
  & button {
    flex: 1;
  }
`;

const Caret = styled.span`
  margin-left: ${({ theme }) => `${theme.space[1]}px`};
`;

export const MenuDivider = styled.hr`
  width: 100%;
  margin: 0;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.color.border.divider};
`;

export default function OverflowMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <Wrapper ref={wrapRef}>
      <Button
        type="button"
        $variant="ghost"
        $size="sm"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        More
        <Caret aria-hidden="true">▾</Caret>
      </Button>
      {open && <Panel role="menu">{children}</Panel>}
    </Wrapper>
  );
}
