import type { ReactNode } from 'react';
import styled from 'styled-components';
import { focusRing } from '../../theme/focusRing';

interface TooltipProps {
  /** The full text shown in the bubble on hover/focus. */
  label: string;
  /** The visible trigger (e.g. a terse badge). */
  children: ReactNode;
}

const Wrap = styled.span`
  position: relative;
  display: inline-flex;
  cursor: help;

  ${focusRing}
`;

const Bubble = styled.span`
  position: absolute;
  bottom: calc(100% + ${({ theme }) => `${theme.space.xxs}px`});
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  max-width: 220px;
  width: max-content;
  padding: ${({ theme }) => `${theme.space.xxs}px ${theme.space.xs}px`};
  background: ${({ theme }) => theme.color.bg.deep};
  color: ${({ theme }) => theme.color.text.body};
  border: 1px solid ${({ theme }) => theme.color.border.default};
  border-radius: ${({ theme }) => theme.radius.sm};
  box-shadow: ${({ theme }) => theme.shadow.panel};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.xs};
  line-height: 1.3;
  text-align: center;
  text-transform: none;
  letter-spacing: normal;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s;

  ${Wrap}:hover &,
  ${Wrap}:focus-visible & {
    opacity: 1;
  }
`;

/**
 * Lightweight CSS-only tooltip: shows `label` in a bubble above `children` on
 * hover or keyboard focus. The bubble text is always in the DOM (so it's
 * available to assistive tech and tests) and merely revealed via opacity.
 */
const Tooltip = ({ label, children }: TooltipProps) => (
  <Wrap tabIndex={0} aria-label={label}>
    {children}
    <Bubble role="tooltip">{label}</Bubble>
  </Wrap>
);

export default Tooltip;
