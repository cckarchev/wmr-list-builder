import { css } from 'styled-components';
import { focusRing } from './focusRing';

/**
 * Shared style for the card's small action controls (Rules / Spells / Upgrades
 * triggers). Embed in a styled button with `${pillButton}` so every disclosure
 * on a unit card reads as the same kind of control.
 */
export const pillButton = css`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
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
  transition:
    border-color 0.12s,
    color 0.12s;

  &:hover {
    border-color: ${({ theme }) => theme.color.border.hover};
    color: ${({ theme }) => theme.color.text.strong};
  }

  ${focusRing}
`;
