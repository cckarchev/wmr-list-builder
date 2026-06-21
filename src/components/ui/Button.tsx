import styled, { css } from 'styled-components';
import { focusRing } from '../../theme/focusRing';

interface ButtonProps {
  $variant?: 'primary' | 'ghost' | 'danger';
  /** 'sm' is the compact size used for inline action rows. */
  $size?: 'md' | 'sm';
}

const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => `${theme.space[2]}px`};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-family: ${({ theme }) => theme.font.display};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.button};
  white-space: nowrap;
  padding: ${({ $size = 'md', theme }) =>
    $size === 'sm'
      ? `${theme.space[2]}px ${theme.space[3]}px`
      : `${theme.space[3]}px ${theme.space[5]}px`};
  text-decoration: none;
  cursor: pointer;
  transition:
    opacity 0.15s,
    border-color 0.15s,
    background 0.15s;

  ${focusRing}

  ${({ $variant = 'primary', theme }) => {
    if ($variant === 'primary')
      return css`
        background: ${theme.color.accent};
        color: ${theme.color.accentInk};
        border: 1px solid transparent;
        &:hover:not(:disabled) {
          opacity: 0.9;
        }
        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `;
    if ($variant === 'danger')
      return css`
        background: transparent;
        color: ${theme.color.semantic.error};
        border: 1px solid ${theme.color.semantic.error};
        &:hover:not(:disabled) {
          opacity: 0.85;
        }
        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `;
    return css`
      background: transparent;
      color: ${theme.color.tealBright};
      border: 1px solid ${theme.color.ghost.border};
      &:hover:not(:disabled) {
        border-color: ${theme.color.ghost.borderHover};
        background: ${theme.color.ghost.bg};
      }
      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    `;
  }}
`;

export default Button;
