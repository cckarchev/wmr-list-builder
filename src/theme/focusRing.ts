import { css } from 'styled-components';

/**
 * Shared keyboard focus indicator. Embed in a styled component with
 * `${focusRing}`. Uses the `border.focus` token so the focus treatment is
 * consistent across every interactive control.
 */
export const focusRing = css`
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.border.focus};
    outline-offset: 2px;
  }
`;
