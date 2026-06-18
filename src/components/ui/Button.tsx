import styled, { css } from 'styled-components';

interface ButtonProps {
  $variant?: 'primary' | 'ghost';
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
  padding: ${({ theme }) => `${theme.space[3]}px ${theme.space[5]}px`};
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.15s, border-color 0.15s, background 0.15s;

  ${({ $variant = 'primary', theme }) =>
    $variant === 'primary'
      ? css`
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
        `
      : css`
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
        `}
`;

export default Button;
