import styled from 'styled-components';

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => `${theme.space.xxs}px ${theme.space.xs}px`};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-family: ${({ theme }) => theme.font.mono};
  font-size: ${({ theme }) => theme.fontSize.xs};
  letter-spacing: ${({ theme }) => theme.tracking.label};
  text-transform: uppercase;
  background: ${({ theme }) => theme.color.bg.tint};
  color: ${({ theme }) => theme.color.text.dim};
  border: 1px solid ${({ theme }) => theme.color.border.divider};
  white-space: nowrap;
`;

export default Chip;
