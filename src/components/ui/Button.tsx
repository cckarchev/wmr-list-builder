import styled, { css } from 'styled-components';

interface ButtonProps {
  $variant?: 'primary' | 'ghost';
}

const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius.sm};
  font-family: ${({ theme }) => theme.font.body};
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: 500;
  padding: ${({ theme }) => `${theme.space[2]}px ${theme.space[3]}px`};
  cursor: pointer;
  transition: opacity 0.15s, border-color 0.15s;

  ${({ $variant = 'primary', theme }) =>
    $variant === 'primary'
      ? css`
          background: ${theme.color.accent};
          color: ${theme.color.accentInk};
          border: none;
          &:hover:not(:disabled) {
            opacity: 0.85;
          }
          &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }
        `
      : css`
          background: transparent;
          color: ${theme.color.tealBright};
          border: 1px solid ${theme.color.teal};
          &:hover:not(:disabled) {
            border-color: ${theme.color.tealBright};
          }
          &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }
        `}
`;

export default Button;
